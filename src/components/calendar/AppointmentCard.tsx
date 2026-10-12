import React from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Clock,
  User,
  MessageSquare,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Clock4,
  MoreVertical,
} from 'lucide-react';
import { generateGoogleCalendarUrl } from '../../utils/calendarExport';

interface AppointmentCardProps {
  appointment: Appointment;
  compact?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  compact = false,
}) => {
  const {
    getClientById,
    getServiceById,
    getStaffById,
    setSelectedAppointmentForDetails,
    setSelectedAppointmentForWhatsApp,
    changeAppointmentStatus,
    businessConfig,
  } = useApp();

  const client = getClientById(appointment.clientId);
  const service = getServiceById(appointment.serviceId);
  const staff = getStaffById(appointment.staffId);

  if (!client || !service) return null;

  const statusConfig: Record<
    AppointmentStatus,
    { label: string; bg: string; text: string; border: string; icon: any }
  > = {
    pending: {
      label: 'Pendiente',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      icon: Clock4,
    },
    in_progress: {
      label: 'En Proceso',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: Clock,
    },
    completed: {
      label: 'Completada',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelada',
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      icon: XCircle,
    },
    no_show: {
      label: 'No Asistió',
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
      icon: AlertCircle,
    },
  };

  const currentStatus = statusConfig[appointment.status];
  const StatusIcon = currentStatus.icon;

  const handleCardClick = () => {
    setSelectedAppointmentForDetails(appointment);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAppointmentForWhatsApp(appointment);
  };

  const handleGoogleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = generateGoogleCalendarUrl(appointment, client, service, staff, businessConfig);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleQuickStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    changeAppointmentStatus(appointment.id, e.target.value as AppointmentStatus);
  };

  if (compact) {
    return (
      <div
        onClick={handleCardClick}
        className="group relative bg-white border border-slate-200 rounded-lg p-2.5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer text-xs space-y-1.5"
      >
        <div className="flex items-center justify-between gap-1">
          <span className="font-mono font-bold text-slate-800 tabular-nums">
            {appointment.startTime}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${currentStatus.bg} ${currentStatus.text}`}>
            {currentStatus.label}
          </span>
        </div>
        <p className="font-semibold text-slate-900 truncate">{client.name}</p>
        <p className="text-[11px] text-slate-500 truncate">{service.name}</p>
        {service.type === 'multi' && appointment.sessionNumber && (
          <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
            Sesión {appointment.sessionNumber}/{appointment.totalSessions}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-2.5"
    >
      {/* Top row: Time + Status selector */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-slate-900 tabular-nums bg-slate-100 px-2 py-0.5 rounded-md">
            {appointment.startTime} - {appointment.endTime}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {service.duration}m
          </span>
        </div>

        {/* Quick status dropdown */}
        <div onClick={(e) => e.stopPropagation()}>
          <select
            value={appointment.status}
            onChange={handleQuickStatusChange}
            className={`text-[11px] font-semibold rounded-lg px-2 py-1 border transition-colors cursor-pointer ${currentStatus.bg} ${currentStatus.text} ${currentStatus.border}`}
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En Proceso</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
            <option value="no_show">No Asistió</option>
          </select>
        </div>
      </div>

      {/* Main Info: Client & Service */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
            {client.name}
          </h4>
          <span className="text-[11px] text-slate-500 font-mono shrink-0 ml-2">
            {client.phone}
          </span>
        </div>

        <p className="text-xs text-slate-600 font-medium line-clamp-1">
          {service.name}
        </p>

        {/* Multisesión Badge */}
        {service.type === 'multi' && (
          <div className="pt-0.5 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md tabular-nums">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Sesión {appointment.sessionNumber || 1} de {appointment.totalSessions || service.totalSessions}
            </span>
            <span className="text-[11px] text-slate-500">
              (Bono Multisesión)
            </span>
          </div>
        )}
      </div>

      {/* Staff & Notes */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 truncate">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: staff?.color || '#4f46e5' }}
          />
          <span className="text-slate-700 font-medium truncate">
            {staff?.name || 'Sin especialista'}
          </span>
        </div>

        {appointment.notes && (
          <span className="text-[11px] text-slate-500 italic max-w-[120px] truncate" title={appointment.notes}>
            "{appointment.notes}"
          </span>
        )}
      </div>

      {/* Quick Action Buttons for Receptionist */}
      <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
        {/* WhatsApp Reminder Button */}
        <button
          type="button"
          onClick={handleWhatsAppClick}
          className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
          title="Enviar recordatorio dinámico por WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Recordatorio WhatsApp</span>
        </button>

        {/* Google Calendar Link Button */}
        <a
          href={generateGoogleCalendarUrl(appointment, client, service, staff, businessConfig)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors border border-slate-200"
          title="Agregar a Google Calendar"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Google Cal</span>
        </a>
      </div>
    </div>
  );
};
