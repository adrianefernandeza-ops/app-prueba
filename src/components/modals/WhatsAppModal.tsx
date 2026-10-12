import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, ExternalLink, X, Copy, Check, Sparkles } from 'lucide-react';
import { generateWhatsAppMessage, cleanPhoneNumber } from '../../utils/whatsapp';

export const WhatsAppModal: React.FC = () => {
  const {
    selectedAppointmentForWhatsApp,
    setSelectedAppointmentForWhatsApp,
    getClientById,
    getServiceById,
    businessConfig,
  } = useApp();

  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (selectedAppointmentForWhatsApp) {
      const client = getClientById(selectedAppointmentForWhatsApp.clientId);
      const service = getServiceById(selectedAppointmentForWhatsApp.serviceId);

      if (client && service) {
        const text = generateWhatsAppMessage(
          selectedAppointmentForWhatsApp,
          client,
          service,
          businessConfig
        );
        setCustomMessage(text);
      }
    }
  }, [selectedAppointmentForWhatsApp, getClientById, getServiceById, businessConfig]);

  if (!selectedAppointmentForWhatsApp) return null;

  const client = getClientById(selectedAppointmentForWhatsApp.clientId);
  const service = getServiceById(selectedAppointmentForWhatsApp.serviceId);

  if (!client || !service) return null;

  const cleanedPhone = cleanPhoneNumber(client.phone);
  const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(customMessage)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setSelectedAppointmentForWhatsApp(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="bg-emerald-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Recordatorio de WhatsApp</h3>
              <p className="text-xs text-emerald-100">Envío directo al cliente de recepción</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedAppointmentForWhatsApp(null)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Destinatario:</span>
              <span className="font-semibold text-slate-800">{client.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Número WhatsApp:</span>
              <span className="font-mono font-bold text-slate-800">{client.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cita:</span>
              <span className="text-slate-700">
                {selectedAppointmentForWhatsApp.date} a las {selectedAppointmentForWhatsApp.startTime}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Mensaje predefinido editable:
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar texto'}
              </button>
            </div>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="w-full p-3 text-xs leading-relaxed bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Al pulsar "Abrir WhatsApp", se abrirá una nueva pestaña con el chat y mensaje listo para enviar.</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedAppointmentForWhatsApp(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cerrar
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSelectedAppointmentForWhatsApp(null)}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir WhatsApp ({client.phone})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
