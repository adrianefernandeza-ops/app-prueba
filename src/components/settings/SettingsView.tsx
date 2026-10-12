import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  MessageSquare,
  Building,
  RotateCcw,
  Save,
  Check,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { businessConfig, updateBusinessConfig, resetToMockData, showConfirm, showToast } = useApp();

  const [name, setName] = useState(businessConfig.name);
  const [phone, setPhone] = useState(businessConfig.phone);
  const [address, setAddress] = useState(businessConfig.address);
  const [currency, setCurrency] = useState(businessConfig.currency);
  const [whatsappTemplate, setWhatsappTemplate] = useState(businessConfig.whatsappTemplate);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig({
      name,
      phone,
      address,
      currency,
      whatsappTemplate,
    });
    setSaved(true);
    showToast('Configuración guardada correctamente', 'success');
    setTimeout(() => setSaved(false), 2500);
  };

  const insertToken = (token: string) => {
    setWhatsappTemplate((prev) => `${prev} ${token}`);
  };

  const handleResetData = () => {
    showConfirm({
      title: 'Restaurar Datos de Demostración',
      message: '¿Confirmas que deseas restaurar los datos iniciales? Se reiniciarán las citas, clientes y servicios a la demo predeterminada.',
      confirmText: 'Restaurar datos',
      isDestructive: false,
      onConfirm: () => {
        resetToMockData();
        showToast('Datos de prueba restaurados correctamente', 'success');
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
          Ajustes de Recepción
        </span>
        <h2 className="text-xl font-bold text-slate-900">
          Configuración del Negocio y Plantillas
        </h2>
        <p className="text-xs text-slate-500">
          Personaliza los datos del centro, las plantillas de WhatsApp y el control de datos.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Datos del Centro / Clínica</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre Comercial del Negocio</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Teléfono Principal de Recepción</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Dirección Física (para eventos de calendario)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Moneda / Divisa</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* WhatsApp Template */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Plantilla de Recordatorio por WhatsApp</h3>
          </div>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Esta plantilla se genera dinámicamente al pulsar el botón "Enviar Recordatorio por WhatsApp" en cualquier cita.
            </p>

            <div>
              <span className="font-semibold text-slate-700 block mb-1.5">Variables disponibles (haz clic para insertar):</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { token: '{cliente}', label: 'Nombre del cliente' },
                  { token: '{servicio}', label: 'Servicio + Sesión' },
                  { token: '{fecha}', label: 'Fecha formateada' },
                  { token: '{hora}', label: 'Hora inicio' },
                  { token: '{negocio}', label: 'Nombre negocio' },
                ].map((item) => (
                  <button
                    key={item.token}
                    type="button"
                    onClick={() => insertToken(item.token)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-mono font-semibold"
                  >
                    + {item.token} ({item.label})
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? '¡Ajustes Guardados!' : 'Guardar Configuración'}
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Datos de Demostración
          </button>
        </div>
      </form>
    </div>
  );
};
