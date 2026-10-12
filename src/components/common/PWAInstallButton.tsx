import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useApp } from '../../context/AppContext';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { showToast } = useApp();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running inside standalone PWA window, hide button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs w-full'
        }`}
        title="Instalar AgendaPro en este dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs w-full'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Instalar en iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-600" />
                  Instalar en iPhone o iPad
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Pulsa el botón <strong>Compartir</strong> (<Share className="w-3.5 h-3.5 inline text-indigo-600" />) en la barra de Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Desliza hacia abajo y selecciona <strong>"Añadir a pantalla de inicio"</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Pulsa <strong>Añadir</strong> para tener acceso directo como app independiente de recepción.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback if not triggered yet
  return (
    <button
      type="button"
      onClick={() => {
        showToast('Para instalar, pulsa el botón de instalación en la barra del navegador o menú "Añadir a pantalla de inicio"', 'info');
      }}
      className={`bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors ${
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-xs w-full'
      }`}
      title="Instalable como PWA"
    >
      <Download className="w-3.5 h-3.5 text-indigo-400" />
      <span>Instalar App</span>
    </button>
  );
};
