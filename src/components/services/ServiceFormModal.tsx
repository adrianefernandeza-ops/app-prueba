import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Service, ServiceType } from '../../types';
import { X, Sparkles, Clock, Tag, DollarSign } from 'lucide-react';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: Service | null;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
}) => {
  const { addService, updateService, businessConfig, showToast } = useApp();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number>(45);
  const [type, setType] = useState<ServiceType>('single');
  const [totalSessions, setTotalSessions] = useState<number>(5);
  const [price, setPrice] = useState<number>(45);
  const [category, setCategory] = useState('Estética');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setDuration(serviceToEdit.duration);
      setType(serviceToEdit.type);
      setTotalSessions(serviceToEdit.totalSessions || 5);
      setPrice(serviceToEdit.price);
      setCategory(serviceToEdit.category);
      setDescription(serviceToEdit.description || '');
    } else {
      setName('');
      setDuration(45);
      setType('single');
      setTotalSessions(5);
      setPrice(40);
      setCategory('Estética Facial');
      setDescription('');
    }
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (serviceToEdit) {
      updateService(serviceToEdit.id, {
        name: name.trim(),
        duration,
        type,
        totalSessions: type === 'multi' ? totalSessions : 1,
        price,
        category,
        description: description.trim() || undefined,
      });
      showToast(`Servicio "${name}" actualizado`, 'success');
    } else {
      addService({
        name: name.trim(),
        duration,
        type,
        totalSessions: type === 'multi' ? totalSessions : 1,
        price,
        category,
        color: type === 'multi' ? 'indigo' : 'emerald',
        description: description.trim() || undefined,
      });
      showToast(`Servicio "${name}" añadido al catálogo`, 'success');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Catálogo de Servicios
            </span>
            <h3 className="text-base font-bold text-slate-900">
              {serviceToEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Name */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Nombre del Servicio *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Tratamiento Radiofrecuencia Facial"
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
              required
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              >
                <option value="Estética Facial">Estética Facial</option>
                <option value="Estética Corporal">Estética Corporal</option>
                <option value="Fisioterapia">Fisioterapia</option>
                <option value="Peluquería">Peluquería</option>
                <option value="Láser & Depilación">Láser & Depilación</option>
                <option value="Bienestar & Masajes">Bienestar & Masajes</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Precio ({businessConfig.currency}) *</label>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Duración (minutos) *</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="5"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-28 p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono font-bold"
                required
              />
              <div className="flex gap-1 overflow-x-auto">
                {[15, 30, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDuration(mins)}
                    className={`px-2 py-1 text-[11px] rounded-lg border font-semibold ${
                      duration === mins
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type: Sesión Única vs Multisesión */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="font-bold text-slate-800 block">Tipo de Servicio *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('single')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  type === 'single'
                    ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 font-bold text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs">Sesión Única</div>
                <div className="text-[10px] text-slate-500 font-normal">Cita individual estándar</div>
              </button>

              <button
                type="button"
                onClick={() => setType('multi')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  type === 'multi'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 font-bold text-indigo-900'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Multisesión
                </div>
                <div className="text-[10px] text-slate-500 font-normal">Bono o tratamiento seriado</div>
              </button>
            </div>

            {/* If Multisesión, specify total sessions */}
            {type === 'multi' && (
              <div className="pt-2 border-t border-slate-200/80 animate-in fade-in duration-150">
                <label className="font-bold text-indigo-950 block mb-1">
                  Número total de sesiones del paquete/bono:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(Number(e.target.value))}
                    className="w-24 p-2 bg-white border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-indigo-950"
                    required
                  />
                  <div className="flex gap-1">
                    {[3, 5, 6, 7, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTotalSessions(num)}
                        className={`px-2 py-1 text-[11px] rounded-lg border font-semibold ${
                          totalSessions === num
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {num} ses.
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  El sistema detectará automáticamente en qué número de sesión va el cliente (ej. "Sesión 3 de {totalSessions}").
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Descripción / Indicaciones (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles del procedimiento o aparatología..."
              rows={2}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
            >
              {serviceToEdit ? 'Guardar Cambios' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
