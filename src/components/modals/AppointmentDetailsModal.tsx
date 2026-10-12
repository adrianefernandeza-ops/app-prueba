import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Clock,
  User,
  Calendar,
  MessageSquare,
  ExternalLink,
  Download,
  Trash2,
  FileText,
  UserCheck,
  CheckCircle,
  Clock4,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { AppointmentStatus } from '../../types';
import { generateGoogleCalendarUrl, downloadICSFile } from '../../utils/calendarExport';
import { formatHumanDate } from '../../utils/whatsapp';

export const AppointmentDetailsModal: React.FC = () => {
  const {
    selectedAppointmentForDetails,
    setSelectedAppointmentForDetails,
    getClientById,
    getServiceById,
    getStaffById,
    changeAppointmentStatus,
    deleteAppointment,
    setSelectedAppointmentForWhatsApp,
    setSelectedClientForDetails,
    businessConfig,
    showConfirm,
    showToast,
  } = useApp();

  if (!selectedAppointmentForDetails) return null;

  const apt = selectedAppointmentForDetails;
  const client = getClientById(apt.clientId);
  const service = getServiceById(apt.serviceId);
  const staff = getStaffById(apt.staffId);

  if (!client || !service) return null;

  const statusOptions: Array<{ value: AppointmentStatus; label: string; color: string; icon: any }> = [
    { value: 'pending', label: 'Pendiente', color: 'bg-amber-50 text-amber-800 border-amber-300', icon: Clock4 },
    { value: 'in_progress', label: 'En Proceso', color: 'bg-blue-50 text-blue-800 border-blue-300', icon: Clock },
    { value: 'completed', label: 'Completada', color: 'bg-emerald-50 text-emerald-800 border-emerald-300', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelada', color: 'bg-rose-50 text-rose-800 border-rose-300', icon: XCircle },
    { value: 'no_show', label: 'No Asistió', color: 'bg-purple-50 text-purple-800 border-purple-300', icon: AlertTriangle },
  ];

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    changeAppointmentStatus(apt.id, newStatus);
    setSelectedAppointmentForDetails(null);
    showToast(`Estado actualizado a ${statusOptions.find((s) => s.value === newStatus)?.label}`, 'success');
  };

  const handleDelete = () => {
    showConfirm({
      title: 'Eliminar Cita de Agenda',
      message: `¿Confirmas que deseas eliminar la cita de ${client.name} para ${service.name}? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar cita',
      isDestructive: true,
      onConfirm: () => {
        deleteAppointment(apt.id);
        setSelectedAppointmentForDetails(null);
        showToast('Cita eliminada correctamente', 'info');
      },
    });
  };

  const handleOpenGoogleCalendar = () => {
    const url = generateGoogleCalendarUrl(apt, client, service, staff, businessConfig);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadICS = () => {
    downloadICSFile(
      [{ appointment: apt, client, service, staff }],
      businessConfig,
      `cita-${client.name.replace(/\s+/g, '_')}-${apt.date}.ics`
    );
  };

  const handleOpenClientDetails = () => {
    setSelectedClientForDetails(client);
    setSelectedAppointmentForDetails(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: staff?.color || '#4f46e5' }}
            />
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Detalle de Cita
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {service.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedAppointmentForDetails(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status selector bar */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Estado de la Cita
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {statusOptions.map((opt) => {
                const isCurrent = apt.status === opt.value;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleStatusChange(opt.value)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isCurrent
                        ? `${opt.color} ring-2 ring-indigo-500/20 shadow-xs font-bold`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multisesión callout if applicable */}
          {service.type === 'multi' && (
            <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                  Tratamiento Multisesión
                </span>
                <p className="text-xs text-indigo-950 font-semibold">
                  Sesión {apt.sessionNumber || 1} de {apt.totalSessions || service.totalSessions}
                </p>
              </div>
              <span className="text-xs bg-indigo-600 text-white font-bold px-2.5 py-1 rounded-lg tabular-nums">
                {Math.round(((apt.sessionNumber || 1) / (apt.totalSessions || service.totalSessions)) * 100)}% Completado
              </span>
            </div>
          )}

          {/* Key Info Details Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
            {/* Client */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Cliente:</span>
                <span className="font-bold text-slate-900">{client.name}</span>
              </div>
              <button
                type="button"
                onClick={handleOpenClientDetails}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs"
              >
                Ver Ficha CRM →
              </button>
            </div>

            {/* Tel */}
            <div className="flex items-center justify-between pl-6">
              <span className="text-slate-500">Teléfono:</span>
              <span className="font-mono text-slate-800">{client.phone}</span>
            </div>

            {/* Schedule */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Horario:</span>
              <span className="font-semibold text-slate-900 capitalize">
                {formatHumanDate(apt.date)}
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {apt.startTime} - {apt.endTime}
              </span>
              <span className="text-slate-400">({service.duration} min)</span>
            </div>

            {/* Specialist */}
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Atendido por:</span>
              <span className="font-semibold text-slate-900">
                {staff?.name || 'No asignado'}
              </span>
              <span className="text-slate-400">({staff?.role})</span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pl-6">
              <span className="text-slate-500">Precio del servicio:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {service.price} {businessConfig.currency}
              </span>
            </div>

            {/* Notes */}
            {apt.notes && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-slate-500 block mb-1">Notas internas:</span>
                <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 text-xs">
                  {apt.notes}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions for Reception */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Acciones de Recepción
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* WhatsApp reminder button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAppointmentForWhatsApp(apt);
                  setSelectedAppointmentForDetails(null);
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <MessageSquare className="w-4 h-4" />
                Recordatorio WhatsApp
              </button>

              {/* Google Calendar button */}
              <a
                href={generateGoogleCalendarUrl(apt, client, service, staff, businessConfig)}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-indigo-600" />
                Abrir en Google Calendar
              </a>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleDownloadICS}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 py-1"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar evento .ics
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 py-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
