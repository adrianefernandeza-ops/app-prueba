import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Service } from '../../types';
import { ServiceFormModal } from './ServiceFormModal';
import {
  Sparkles,
  Plus,
  Clock,
  Edit2,
  Trash2,
  CalendarPlus,
  Search,
  Tag,
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { services, deleteService, openNewAppointmentModal, businessConfig, showConfirm, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = Array.from(new Set(services.map((s) => s.category)));

  const filtered = services.filter((srv) => {
    if (selectedCategory !== 'all' && srv.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        srv.name.toLowerCase().includes(q) ||
        (srv.description && srv.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleEdit = (srv: Service) => {
    setEditingService(srv);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm({
      title: 'Eliminar Servicio',
      message: `¿Seguro que deseas eliminar el servicio "${name}" del catálogo?`,
      confirmText: 'Sí, eliminar',
      isDestructive: true,
      onConfirm: () => {
        deleteService(id);
        showToast(`Servicio "${name}" eliminado`, 'info');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Configuración de Carta
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Catálogo de Servicios y Tratamientos
          </h2>
          <p className="text-xs text-slate-500">
            Define la duración, precios y bonos multisesión con cálculo automático de sesiones.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Nuevo Servicio
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre de servicio..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Servicio / Tratamiento</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Duración</th>
                <th className="py-3 px-4">Tipo & Sesiones</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((srv) => (
                <tr key={srv.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Name and desc */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block text-sm">
                      {srv.name}
                    </span>
                    {srv.description && (
                      <span className="text-[11px] text-slate-500 block max-w-sm truncate">
                        {srv.description}
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-slate-600 font-medium">
                      {srv.category}
                    </span>
                  </td>

                  {/* Duration */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-slate-700 font-bold tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {srv.duration} min
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {srv.type === 'multi' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-800 font-bold text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Multisesión ({srv.totalSessions} Sesiones)</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 font-medium">
                        Sesión Única (1)
                      </span>
                    )}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-extrabold text-slate-900 text-sm tabular-nums">
                      {srv.price} {businessConfig.currency}
                    </span>
                    {srv.type === 'multi' && (
                      <span className="text-[10px] text-slate-400 block">
                        ({Math.round(srv.price / srv.totalSessions)} {businessConfig.currency}/sesión)
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openNewAppointmentModal({ serviceId: srv.id })}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs flex items-center gap-1"
                        title="Agendar cita con este servicio"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        Agendar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(srv)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                        title="Editar servicio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(srv.id, srv.name)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Eliminar servicio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No se encontraron servicios que coincidan con la búsqueda.
          </div>
        )}
      </div>

      {/* Modal Form */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={editingService}
      />
    </div>
  );
};
