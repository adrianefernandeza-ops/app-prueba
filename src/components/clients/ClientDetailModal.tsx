import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Phone,
  Mail,
  FileText,
  CalendarPlus,
  MessageSquare,
  PackageCheck,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Edit2,
  Check,
} from 'lucide-react';
import { formatHumanDate } from '../../utils/whatsapp';
import { AppointmentStatus, Client } from '../../types';

export const ClientDetailModal: React.FC = () => {
  const {
    selectedClientForDetails,
    setSelectedClientForDetails,
    appointments,
    packages,
    services,
    staff,
    openNewAppointmentModal,
    updateClient,
    businessConfig,
    showToast,
  } = useApp();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  if (!selectedClientForDetails) return null;

  const client = selectedClientForDetails;

  // Filter client appointments sorted chronologically
  const clientAppointments = appointments
    .filter((a) => a.clientId === client.id)
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime();
    });

  // Filter client packages
  const clientPackages = packages.filter((p) => p.clientId === client.id);

  const handleSaveNotes = () => {
    updateClient(client.id, { notes: editedNotes });
    setIsEditingNotes(false);
    showToast('Notas del cliente actualizadas correctamente', 'success');
  };

  const startEditNotes = () => {
    setEditedNotes(client.notes || '');
    setIsEditingNotes(true);
  };

  const handleScheduleForClient = (serviceId?: string) => {
    const srv = serviceId ? services.find((s) => s.id === serviceId) : undefined;
    setSelectedClientForDetails(null);
    openNewAppointmentModal({
      clientId: client.id,
      serviceId: srv?.id,
    });
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'completed':
        return <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Completada</span>;
      case 'in_progress':
        return <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">En Proceso</span>;
      case 'pending':
        return <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pendiente</span>;
      case 'cancelled':
        return <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Cancelada</span>;
      case 'no_show':
        return <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">No Asistió</span>;
    }
  };

  const cleanPhone = client.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Ficha de Cliente · CRM Interno
            </span>
            <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {client.phone}
              </span>
              {client.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {client.email}
                </span>
              )}
              <span className="text-slate-400">·</span>
              <span>Registrado: {client.createdAt}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedClientForDetails(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Action Bar for receptionist */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleScheduleForClient()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              + Agendar Cita para {client.name.split(' ')[0]}
            </button>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Chat WhatsApp
            </a>
          </div>

          {/* Contact Notes / Medical / Allergies Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Notas de Recepción, Alergias y Preferencias
              </span>
              {!isEditingNotes ? (
                <button
                  type="button"
                  onClick={startEditNotes}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Editar notas
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(false)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="text-xs text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Guardar
                  </button>
                </div>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                placeholder="Observaciones clínicas, alergias, requerimientos especiales..."
              />
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed italic">
                {client.notes || 'Sin notas registradas para este cliente.'}
              </p>
            )}
          </div>

          {/* Section: Resumen de Paquetes Activos (Multisesiones) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-indigo-600" />
                Paquetes Activos y Bonos ({clientPackages.length})
              </h3>
            </div>

            {clientPackages.length > 0 ? (
              <div className="space-y-3">
                {clientPackages.map((pkg) => {
                  const srv = services.find((s) => s.id === pkg.serviceId);
                  const relatedApts = clientAppointments.filter((a) => a.serviceId === pkg.serviceId);
                  const completed = relatedApts.filter((a) => a.status === 'completed').length;
                  const pending = relatedApts.filter((a) => a.status === 'pending' || a.status === 'in_progress').length;
                  const remaining = Math.max(0, pkg.totalSessions - (completed + pending));
                  const progressPct = Math.round((completed / pkg.totalSessions) * 100);

                  return (
                    <div
                      key={pkg.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                            {srv?.category || 'Tratamiento'}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            {srv?.name || 'Servicio multisesión'}
                          </h4>
                          <span className="text-xs text-slate-500">
                            Iniciado el {pkg.startDate}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            {completed} de {pkg.totalSessions} completadas
                          </span>
                          <p className="text-[11px] text-slate-500">
                            {remaining > 0 ? `${remaining} pendientes por agendar` : '¡Todas agendadas!'}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${progressPct}%` }}
                            title={`${completed} sesiones completadas`}
                          />
                          <div
                            className="bg-indigo-400 h-full transition-all"
                            style={{ width: `${(pending / pkg.totalSessions) * 100}%` }}
                            title={`${pending} sesiones programadas`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            {completed} completadas
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                            {pending} en agenda
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                            {remaining} restantes
                          </span>
                        </div>
                      </div>

                      {/* Quick reschedule button for remaining sessions */}
                      {remaining > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleScheduleForClient(pkg.serviceId)}
                            className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            Agendar siguiente sesión ({completed + pending + 1} de {pkg.totalSessions})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 text-center text-xs text-slate-500 border border-dashed border-slate-200">
                Este cliente no cuenta con paquetes multisesión activos actualmente.
              </div>
            )}
          </div>

          {/* Section: Historial de Citas (Pasadas y Futuras) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Historial de Citas ({clientAppointments.length})
            </h3>

            {clientAppointments.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {clientAppointments.map((apt) => {
                  const srv = services.find((s) => s.id === apt.serviceId);
                  const st = staff.find((s) => s.id === apt.staffId);

                  return (
                    <div
                      key={apt.id}
                      className="p-3 hover:bg-slate-50/60 transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {srv?.name || 'Servicio'}
                          </span>
                          {apt.sessionNumber && (
                            <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                              Sesión {apt.sessionNumber}/{apt.totalSessions}
                            </span>
                          )}
                          {getStatusBadge(apt.status)}
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                          <span>{formatHumanDate(apt.date)}</span>
                          <span>·</span>
                          <span className="font-mono">{apt.startTime} - {apt.endTime}</span>
                          <span>·</span>
                          <span>{st?.name || 'Especialista'}</span>
                        </div>
                        {apt.notes && (
                          <p className="text-[11px] text-slate-500 italic">
                            "{apt.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No hay historial de citas registrado para este cliente.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
