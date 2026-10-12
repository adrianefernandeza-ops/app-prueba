import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Staff } from '../../types';
import {
  Users,
  UserPlus,
  Phone,
  Briefcase,
  Calendar,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { staff, appointments, selectedDate, addStaff, updateStaff, deleteStaff, showConfirm, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [color, setColor] = useState('#4f46e5');

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setName('');
    setRole('');
    setPhone('');
    setColor('#4f46e5');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (st: Staff) => {
    setEditingStaff(st);
    setName(st.name);
    setRole(st.role);
    setPhone(st.phone || '');
    setColor(st.color);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim() || undefined,
        color,
      });
      showToast(`Datos de ${name} actualizados`, 'success');
    } else {
      addStaff({
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim() || undefined,
        color,
        active: true,
      });
      showToast(`Especialista ${name} añadido al equipo`, 'success');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Personal de Cabina y Gabinete
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Especialistas y Equipo
          </h2>
          <p className="text-xs text-slate-500">
            Gestiona los profesionales para asignar turnos y citas en recepción.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          + Añadir Especialista
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {staff.map((st) => {
          const todayApts = appointments.filter(
            (a) => a.staffId === st.id && a.date === selectedDate
          );
          const totalApts = appointments.filter((a) => a.staffId === st.id);

          return (
            <div
              key={st.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs"
                      style={{ backgroundColor: st.color }}
                    >
                      {st.name.charAt(0)}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{st.name}</h4>
                      <span className="text-xs text-slate-500">{st.role}</span>
                    </div>
                  </div>
                </div>

                {st.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{st.phone}</span>
                  </div>
                )}

                {/* Workload */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 grid grid-cols-2 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Citas Hoy</span>
                    <span className="text-base font-bold text-indigo-600 font-mono tabular-nums">
                      {todayApts.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Citas</span>
                    <span className="text-base font-bold text-slate-800 font-mono tabular-nums">
                      {totalApts.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(st)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  title="Editar"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showConfirm({
                      title: 'Eliminar Especialista',
                      message: `¿Seguro que deseas eliminar a ${st.name} del equipo?`,
                      confirmText: 'Sí, eliminar',
                      isDestructive: true,
                      onConfirm: () => {
                        deleteStaff(st.id);
                        showToast(`Especialista ${st.name} eliminado`, 'info');
                      },
                    });
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingStaff ? 'Editar Especialista' : 'Nuevo Especialista'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Dr. Andrés Peña"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Especialidad / Cargo *</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Ej. Fisioterapeuta Deportivo"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Teléfono interno (opcional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Color representativo en agenda</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="font-mono text-slate-600">{color}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
