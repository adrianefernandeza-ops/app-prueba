import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  UserPlus,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Check,
  Share2,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react';
import { Client, Service, Staff } from '../../types';

export const NewAppointmentModal: React.FC = () => {
  const {
    isNewAppointmentModalOpen,
    closeNewAppointmentModal,
    newAppointmentPreset,
    clients,
    services,
    staff,
    selectedDate,
    addAppointment,
    addClient,
    calculateMultisessionInfo,
    businessConfig,
    setSelectedAppointmentForWhatsApp,
    showToast,
  } = useApp();

  // Selected client state
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearch, setClientSearch] = useState<string>('');
  const [isCreatingNewClient, setIsCreatingNewClient] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [newClientNotes, setNewClientNotes] = useState<string>('');

  // Service, Staff & Date/Time
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [date, setDate] = useState<string>(selectedDate);
  const [startTime, setStartTime] = useState<string>('10:00');
  const [notes, setNotes] = useState<string>('');
  const [manualSessionNumber, setManualSessionNumber] = useState<number | undefined>();

  // Feedback banner after saving
  const [successInfo, setSuccessInfo] = useState<{
    id: string;
    clientName: string;
    serviceName: string;
  } | null>(null);

  // Initialize or update form whenever preset or modal opens
  useEffect(() => {
    if (isNewAppointmentModalOpen) {
      setSuccessInfo(null);
      setIsCreatingNewClient(false);

      if (newAppointmentPreset) {
        setSelectedClientId(newAppointmentPreset.clientId || '');
        setSelectedServiceId(newAppointmentPreset.serviceId || '');
        setSelectedStaffId(newAppointmentPreset.staffId || (staff[0]?.id || ''));
        setDate(newAppointmentPreset.date || selectedDate);
        setStartTime(newAppointmentPreset.startTime || '10:00');
        setNotes(newAppointmentPreset.notes || '');
        setManualSessionNumber(newAppointmentPreset.sessionNumber);
        
        if (newAppointmentPreset.clientId) {
          const c = clients.find((cli) => cli.id === newAppointmentPreset.clientId);
          if (c) setClientSearch(c.name);
        }
      } else {
        setSelectedClientId('');
        setClientSearch('');
        setSelectedServiceId(services[0]?.id || '');
        setSelectedStaffId(staff[0]?.id || '');
        setDate(selectedDate);
        setStartTime('10:00');
        setNotes('');
        setManualSessionNumber(undefined);
      }
    }
  }, [isNewAppointmentModalOpen, newAppointmentPreset, selectedDate, services, staff]);

  // Filter clients based on search query
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients.slice(0, 5);
    const query = clientSearch.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone.replace(/\s+/g, '').includes(query.replace(/\s+/g, ''))
    );
  }, [clients, clientSearch]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId),
    [clients, selectedClientId]
  );

  // Auto-detect multi-session status
  const multisessionInfo = useMemo(() => {
    if (!selectedClientId || !selectedServiceId) return null;
    return calculateMultisessionInfo(selectedClientId, selectedServiceId);
  }, [selectedClientId, selectedServiceId, calculateMultisessionInfo]);

  // Calculate End Time from Start Time + Duration
  const calculatedEndTime = useMemo(() => {
    if (!startTime || !selectedService) return startTime;
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + selectedService.duration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }, [startTime, selectedService]);

  if (!isNewAppointmentModalOpen) return null;

  const handleSelectClient = (client: Client) => {
    setSelectedClientId(client.id);
    setClientSearch(client.name);
    setIsCreatingNewClient(false);
  };

  const handleCreateAndSelectNewClient = () => {
    if (!newClientName.trim() || !newClientPhone.trim()) {
      showToast('Por favor introduce al menos nombre y teléfono del cliente.', 'error');
      return;
    }
    const created = addClient({
      name: newClientName.trim(),
      phone: newClientPhone.trim(),
      email: newClientEmail.trim() || undefined,
      notes: newClientNotes.trim() || undefined,
    });
    setSelectedClientId(created.id);
    setClientSearch(created.name);
    setIsCreatingNewClient(false);
    showToast(`Cliente ${created.name} registrado y seleccionado`, 'success');
    // Reset inputs
    setNewClientName('');
    setNewClientPhone('');
    setNewClientEmail('');
    setNewClientNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClientId) {
      showToast('Por favor selecciona o crea un cliente para agendar la cita.', 'error');
      return;
    }
    if (!selectedServiceId) {
      showToast('Por favor selecciona un servicio.', 'error');
      return;
    }
    if (!selectedStaffId) {
      showToast('Por favor selecciona al especialista o encargado.', 'error');
      return;
    }

    const srv = selectedService;
    let sessionNum = manualSessionNumber;
    let totalSessions = srv?.totalSessions || 1;

    if (srv?.type === 'multi') {
      if (!sessionNum && multisessionInfo) {
        sessionNum = multisessionInfo.sessionNumber;
        totalSessions = multisessionInfo.totalSessions;
      }
    } else {
      sessionNum = 1;
      totalSessions = 1;
    }

    const createdApt = addAppointment({
      clientId: selectedClientId,
      serviceId: selectedServiceId,
      staffId: selectedStaffId,
      packageId: multisessionInfo?.packageId,
      date,
      startTime,
      endTime: calculatedEndTime,
      status: 'pending',
      sessionNumber: sessionNum,
      totalSessions,
      notes: notes.trim() || undefined,
    });

    showToast(`¡Cita agendada con éxito para ${selectedClient?.name || 'el cliente'}!`, 'success');
    closeNewAppointmentModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full my-auto overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Recepción & Agenda
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Agendar Nueva Cita
            </h2>
          </div>
          <button
            type="button"
            onClick={closeNewAppointmentModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Cliente Selection / Creation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span>1. Cliente</span>
                <span className="text-rose-500">*</span>
              </label>
              {!isCreatingNewClient ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingNewClient(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + Crear Nuevo Cliente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingNewClient(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Volver a búsqueda
                </button>
              )}
            </div>

            {isCreatingNewClient ? (
              /* Inline New Client Creation */
              <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  Registrar nuevo cliente en el sistema
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600">Nombre completo *</label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="Ej. Carmen Ortiz Díaz"
                      className="w-full mt-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Teléfono (WhatsApp) *</label>
                    <input
                      type="tel"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      placeholder="Ej. +34 612 998 877"
                      className="w-full mt-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Correo Electrónico (opcional)</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full mt-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Notas de recepción (alergias/preferencias)</label>
                    <input
                      type="text"
                      value={newClientNotes}
                      onChange={(e) => setNewClientNotes(e.target.value)}
                      placeholder="Ej. Piel sensible, horario mañanas"
                      className="w-full mt-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewClient(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateAndSelectNewClient}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    Guardar y Seleccionar
                  </button>
                </div>
              </div>
            ) : (
              /* Quick Client Search Input & Dropdown */
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      if (selectedClientId && e.target.value !== selectedClient?.name) {
                        setSelectedClientId('');
                      }
                    }}
                    placeholder="Buscar cliente por nombre o teléfono..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {selectedClient && (
                    <span className="absolute right-3 top-2.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Seleccionado
                    </span>
                  )}
                </div>

                {/* Suggestions if not explicitly chosen or query active */}
                {!selectedClientId && clientSearch.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => handleSelectClient(client)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 block">{client.name}</span>
                            <span className="text-slate-500 font-mono text-[11px]">{client.phone}</span>
                          </div>
                          <span className="text-indigo-600 font-medium">Elegir</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-slate-500">
                        No se encontraron clientes coincidentes.{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setNewClientName(clientSearch);
                            setIsCreatingNewClient(true);
                          }}
                          className="text-indigo-600 font-semibold underline ml-1"
                        >
                          Crear "{clientSearch}"
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Client pill summary */}
                {selectedClient && (
                  <div className="mt-2 text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    <span className="font-medium text-slate-900">{selectedClient.name}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-600">{selectedClient.phone}</span>
                    {selectedClient.notes && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 truncate max-w-xs">{selectedClient.notes}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Seleccionar Servicio & Automatic Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>2. Servicio</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <select
                  value={selectedServiceId}
                  onChange={(e) => {
                    setSelectedServiceId(e.target.value);
                    setManualSessionNumber(undefined);
                  }}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium text-slate-900"
                  required
                >
                  <option value="" disabled>
                    -- Seleccionar Servicio --
                  </option>
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} ({srv.duration} min - {srv.price} {businessConfig.currency}) {srv.type === 'multi' ? `[Bono ${srv.totalSessions} Ses.]` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Details Badge */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 flex flex-col justify-center">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider">Duración & Precio</span>
                <span className="text-xs font-semibold text-slate-900">
                  {selectedService ? `${selectedService.duration} min · ${selectedService.price} ${businessConfig.currency}` : 'Seleccione servicio'}
                </span>
              </div>
            </div>

            {/* AUTOMATIC MULTISESSION DETECTION (CARACTERÍSTICA CLAVE) */}
            {selectedService?.type === 'multi' && (
              <div className="p-3.5 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-200 rounded-xl animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-900">
                          Servicio Multisesión Detectado
                        </span>
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-600 text-white rounded-md tabular-nums">
                          Sesión {manualSessionNumber || multisessionInfo?.sessionNumber || 1} de {selectedService.totalSessions}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {multisessionInfo?.isNewPackage
                          ? '✨ Primera sesión del paquete. El sistema creará y vinculará el bono activo para el cliente.'
                          : `Continuación de paquete en curso. Se asignará la sesión ${manualSessionNumber || multisessionInfo?.sessionNumber || 1} automáticamente.`}
                      </p>
                    </div>
                  </div>

                  {/* Manual adjustment override if receptionist needs */}
                  <div className="text-right shrink-0">
                    <label className="text-[10px] uppercase font-semibold text-slate-500 block">Nº Sesión</label>
                    <select
                      value={manualSessionNumber || multisessionInfo?.sessionNumber || 1}
                      onChange={(e) => setManualSessionNumber(Number(e.target.value))}
                      className="text-xs font-bold bg-white border border-indigo-300 rounded-md px-2 py-1 text-indigo-900"
                    >
                      {Array.from({ length: selectedService.totalSessions }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Sesión {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Seleccionar Especialista / Atendido Por */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>3. Especialista / Atendido Por</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {staff.map((st) => {
                const isSelected = selectedStaffId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setSelectedStaffId(st.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: st.color }}
                      />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {st.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 truncate">
                      {st.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Fecha y Hora de Inicio (+ Fin Automático) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>4. Horario de la Cita</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Fecha</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Hora Inicio</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    step="900" // 15 min intervals
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Hora Fin (Calculada)</label>
                <div className="w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-mono font-medium flex items-center justify-between">
                  <span>{calculatedEndTime}</span>
                  <span className="text-[11px] text-slate-500">
                    ({selectedService?.duration || 0} min)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Notas Opcionales */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              5. Observaciones / Notas Internas de la Cita (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Prefiere zona tranquila, traer ficha anterior, aplicar toalla tibia..."
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={closeNewAppointmentModal}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                Agendar Cita en Calendario
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
