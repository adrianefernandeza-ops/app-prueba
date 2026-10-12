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
  // RGBA buffer
  // Draw an indigo gradient background with rounded rectangle and calendar grid
  const rowBytes = width * 4 + 1; // 1 filter byte per row
  const rawData = Buffer.alloc(rowBytes * height);

  const centerX = width / 2;
  const centerY = height / 2;
  const margin = isMaskable ? width * 0.15 : width * 0.08;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Base background: deep indigo #4338ca (top) to #312e81 (bottom)
      const gradT = y / height;
      let r = Math.round(67 * (1 - gradT) + 49 * gradT);
      let g = Math.round(56 * (1 - gradT) + 46 * gradT);
      let b = Math.round(202 * (1 - gradT) + 129 * gradT);
      let a = 255;

      // Draw calendar card in center:
      const cardLeft = margin;
      const cardRight = width - margin;
      const cardTop = margin + (height * 0.04);
      const cardBottom = height - margin - (height * 0.04);

      if (x >= cardLeft && x <= cardRight && y >= cardTop && y <= cardBottom) {
        // Inside calendar card: white #ffffff
        r = 255;
        g = 255;
        b = 255;

        // Top bar of calendar: violet #6366f1
        const headerHeight = (cardBottom - cardTop) * 0.30;
        if (y <= cardTop + headerHeight) {
          r = 99;
          g = 102;
          b = 241;
        } else {
          // Calendar grid dots / checks inside:
          const gridY = (y - (cardTop + headerHeight)) / (cardBottom - (cardTop + headerHeight));
          const gridX = (x - cardLeft) / (cardRight - cardLeft);
          
          // Draw grid blocks
          const cellX = Math.floor(gridX * 4);
          const cellY = Math.floor(gridY * 3);
          const fracX = (gridX * 4) - cellX;
          const fracY = (gridY * 3) - cellY;

          if (fracX > 0.25 && fracX < 0.75 && fracY > 0.25 && fracY < 0.75) {
            // Checkmark / appointment block in cell
            if ((cellX + cellY) % 2 === 0) {
              r = 79;
              g = 70;
              b = 229; // indigo block
            } else {
              r = 16, g = 185, b = 129; // emerald block
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

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // Color type 6 (RGBA)
  ihdr[10] = 0; // Compression Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace None

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT Chunk (compressed raw data)
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PNG icons for PWA and PWABuilder compliance...');

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(64, 64, false));

console.log('Icons generated successfully in public/');
