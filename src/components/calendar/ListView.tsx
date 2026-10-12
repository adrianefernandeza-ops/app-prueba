import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AppointmentStatus } from '../../types';
import {
  Clock,
  User,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Download,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import { generateGoogleCalendarUrl } from '../../utils/calendarExport';

export const ListView: React.FC = () => {
  const {
    appointments,
    selectedDate,
    selectedStaffFilter,
    getClientById,
    getServiceById,
    getStaffById,
    changeAppointmentStatus,
    setSelectedAppointmentForDetails,
    setSelectedAppointmentForWhatsApp,
    deleteAppointment,
    businessConfig,
    showConfirm,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AppointmentStatus>('all');

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((apt) => {
        if (apt.date !== selectedDate) return false;
        if (selectedStaffFilter !== 'all' && apt.staffId !== selectedStaffFilter) return false;
        if (statusFilter !== 'all' && apt.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const client = getClientById(apt.clientId);
          const service = getServiceById(apt.serviceId);
          const staff = getStaffById(apt.staffId);

          const matchesClient = client && (
            client.name.toLowerCase().includes(q) ||
            client.phone.includes(q)
          );
          const matchesService = service && service.name.toLowerCase().includes(q);
          const matchesStaff = staff && staff.name.toLowerCase().includes(q);

          if (!matchesClient && !matchesService && !matchesStaff) return false;
        }

        return true;
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [appointments, selectedDate, selectedStaffFilter, statusFilter, searchQuery, getClientById, getServiceById, getStaffById]);

  return (
    <div className="space-y-4">
      {/* Search and status filters bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, teléfono o servicio en el día..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'in_progress', 'completed', 'no_show'] as const).map((st) => {
            const labels: Record<string, string> = {
              all: 'Todas',
              pending: 'Pendientes',
              in_progress: 'En Proceso',
              completed: 'Completadas',
              no_show: 'No Asistió',
            };
            const active = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Hora</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Servicio / Paquete</th>
                  <th className="py-3 px-4">Especialista</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((apt) => {
                  const client = getClientById(apt.clientId);
                  const service = getServiceById(apt.serviceId);
                  const staff = getStaffById(apt.staffId);

                  if (!client || !service) return null;

                  return (
                    <tr
                      key={apt.id}
                      onClick={() => setSelectedAppointmentForDetails(apt)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      {/* Time */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 tabular-nums">
                          {apt.startTime}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px] block">
                          hasta {apt.endTime}
                        </span>
                      </td>

                      {/* Client */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">
                          {client.name}
                        </span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {client.phone}
                        </span>
                      </td>

                      {/* Service & Multisesión */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {service.name}
                        </span>
                        {service.type === 'multi' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-md mt-1">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            Sesión {apt.sessionNumber || 1} de {apt.totalSessions || service.totalSessions}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {service.duration} min
                          </span>
                        )}
                      </td>

                      {/* Specialist */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: staff?.color || '#4f46e5' }}
                          />
                          <span className="text-slate-700 font-medium">
                            {staff?.name || 'Sin asignar'}
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={apt.status}
                          onChange={(e) => changeAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition-colors cursor-pointer ${
                            apt.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : apt.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : apt.status === 'cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : apt.status === 'no_show'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="in_progress">En Proceso</option>
                          <option value="completed">Completada</option>
                          <option value="cancelled">Cancelada</option>
                          <option value="no_show">No Asistió</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp */}
                          <button
                            type="button"
                            onClick={() => setSelectedAppointmentForWhatsApp(apt)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                            title="Enviar recordatorio WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Google Cal */}
                          <button
                            type="button"
                            onClick={() => {
                              const url = generateGoogleCalendarUrl(apt, client, service, staff, businessConfig);
                              window.open(url, '_blank', 'noopener,noreferrer');
                            }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                            title="Abrir en Google Calendar"
                          >
                            <ExternalLink className="w-4 h-4 text-indigo-600" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => {
                              showConfirm({
                                title: 'Eliminar Cita',
                                message: `¿Deseas eliminar la cita de ${client.name}?`,
                                confirmText: 'Eliminar',
                                isDestructive: true,
                                onConfirm: () => {
                                  deleteAppointment(apt.id);
                                  showToast('Cita eliminada correctamente', 'info');
                                },
                              });
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                            title="Eliminar cita"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            No hay citas registradas para este filtro en la fecha seleccionada.
          </div>
        )}
      </div>
    </div>
  );
};
