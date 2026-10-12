import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, CalendarPlus, X, CheckCircle2, ArrowRight } from 'lucide-react';

export const NextSessionPromptModal: React.FC = () => {
  const {
    isNextSessionPromptOpen,
    nextSessionPromptInfo,
    closeNextSessionPrompt,
    confirmScheduleNextSession,
  } = useApp();

  if (!isNextSessionPromptOpen || !nextSessionPromptInfo) {
    return null;
  }

  const { appointment, client, service, remainingSessions, nextSessionNumber } = nextSessionPromptInfo;
  const currentSessionNumber = appointment.sessionNumber || 1;
  const total = service.totalSessions || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden scale-in-95 duration-200">
        {/* Header with success badge */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                Sesión completada con éxito
              </span>
              <h3 className="text-lg font-bold text-white">
                Seguimiento de Paquete
              </h3>
            </div>
          </div>
          <button
            onClick={closeNextSessionPrompt}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-5">
          <div className="text-center py-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Multisesión detectada
            </div>
            <h4 className="text-xl font-bold text-slate-900">
              ¿Deseas agendar la siguiente sesión ahora?
            </h4>
            <p className="text-sm text-slate-600 mt-2">
              Le restan <strong className="text-indigo-600 font-bold tabular-nums">{remainingSessions} {remainingSessions === 1 ? 'sesión' : 'sesiones'}</strong> por agendar a <strong className="text-slate-800">{client.name}</strong> en su paquete.
            </p>
          </div>

          {/* Service progress card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Tratamiento en curso</p>
                <p className="text-sm font-semibold text-slate-900">{service.name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-slate-500">Progreso</span>
                <p className="text-sm font-bold text-slate-900 tabular-nums">
                  {currentSessionNumber} / {total}
                </p>
              </div>
            </div>

            {/* Visual session step indicators */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {Array.from({ length: total }).map((_, idx) => {
                const sessionIdx = idx + 1;
                const isCompleted = sessionIdx <= currentSessionNumber;
                const isNext = sessionIdx === nextSessionNumber;

                return (
                  <div
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isNext
                        ? 'bg-indigo-500 ring-2 ring-indigo-200 ring-offset-1'
                        : 'bg-slate-200'
                    }`}
                    title={`Sesión ${sessionIdx}`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Sesión {currentSessionNumber} recién finalizada</span>
              <span className="font-semibold text-indigo-600">Próxima: Sesión {nextSessionNumber}</span>
            </div>
          </div>

          {/* Clarification prompt */}
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex gap-2.5 items-start text-xs text-amber-800">
            <span className="font-semibold shrink-0">💡 Consejo de recepción:</span>
            <span>
              Fijar la cita hoy garantiza la continuidad del tratamiento y asegura disponibilidad en la agenda del especialista.
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeNextSessionPrompt}
              className="w-full sm:w-1/2 py-2.5 px-4 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors order-2 sm:order-1"
            >
              Agendar más tarde
            </button>
            <button
              type="button"
              onClick={confirmScheduleNextSession}
              className="w-full sm:w-1/2 py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Agendar Sesión {nextSessionNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
