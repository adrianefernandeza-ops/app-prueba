import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generatePNG(width, height, isMaskable = false) {
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(rowBytes * height);
  const margin = isMaskable ? width * 0.15 : width * 0.08;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      const gradT = y / height;
      let r = Math.round(79 * (1 - gradT) + 49 * gradT);
      let g = Math.round(70 * (1 - gradT) + 46 * gradT);
      let b = Math.round(229 * (1 - gradT) + 129 * gradT);
      let a = 255;

      const cardLeft = margin;
      const cardRight = width - margin;
      const cardTop = margin + (height * 0.04);
      const cardBottom = height - margin - (height * 0.04);

      if (x >= cardLeft && x <= cardRight && y >= cardTop && y <= cardBottom) {
        r = 255;
        g = 255;
        b = 255;

        const headerHeight = (cardBottom - cardTop) * 0.28;
        if (y <= cardTop + headerHeight) {
          r = 79;
          g = 70;
          b = 229;
        } else {
          const gridY = (y - (cardTop + headerHeight)) / (cardBottom - (cardTop + headerHeight));
          const gridX = (x - cardLeft) / (cardRight - cardLeft);
          const cellX = Math.floor(gridX * 4);
          const cellY = Math.floor(gridY * 3);
          const fracX = (gridX * 4) - cellX;
          const fracY = (gridY * 3) - cellY;

          if (fracX > 0.25 && fracX < 0.75 && fracY > 0.25 && fracY < 0.75) {
            if ((cellX + cellY) % 2 === 0) {
              r = 99; g = 102; b = 241;
            } else {
              r = 16; g = 185; b = 129;
            }
          }
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData, { level: 8 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function generateScreenshot(width, height) {
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0;

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Slate dashboard background (#f8fafc)
      let r = 248, g = 250, b = 252, a = 255;

      // Dark sidebar on left
      if (x < width * 0.2) {
        r = 15; g = 23; b = 42; // Slate 900
      }

      // Top header bar
      if (y < height * 0.08 && x >= width * 0.2) {
        r = 255; g = 255; b = 255;
      }

      // Calendar card blocks inside dashboard area
      if (x > width * 0.25 && x < width * 0.95 && y > height * 0.15 && y < height * 0.85) {
        // Grid pattern
        const inCardX = (x - width * 0.25) / (width * 0.7);
        const inCardY = (y - height * 0.15) / (height * 0.7);

        const col = Math.floor(inCardX * 5);
        const row = Math.floor(inCardY * 4);
        const cellFracX = (inCardX * 5) - col;
        const cellFracY = (inCardY * 4) - row;

        if (cellFracX > 0.08 && cellFracX < 0.92 && cellFracY > 0.12 && cellFracY < 0.88) {
          // Appointment cards
          if ((col + row) % 3 === 0) {
            r = 238; g = 242; b = 255; // Indigo tint
          } else if ((col + row) % 3 === 1) {
            r = 236; g = 253; b = 245; // Emerald tint
          } else {
            r = 255; g = 255; b = 255;
          }
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData, { level: 6 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA & Microsoft Store compatible assets...');

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(64, 64, false));

// Microsoft Windows Store Tiles
fs.writeFileSync(path.join(publicDir, 'windows-44x44.png'), generatePNG(44, 44, false));
fs.writeFileSync(path.join(publicDir, 'windows-150x150.png'), generatePNG(150, 150, false));
fs.writeFileSync(path.join(publicDir, 'windows-310x310.png'), generatePNG(310, 310, false));

// Screenshots required for PWABuilder Rich Install UI & Microsoft Store packaging
console.log('Generating desktop and mobile screenshots for PWABuilder...');
fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), generateScreenshot(1280, 720));
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), generateScreenshot(750, 1334));

console.log('All icons and screenshots generated successfully!');
