import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PackageCheck,
  CalendarPlus,
  Sparkles,
  Search,
  User,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const PackagesView: React.FC = () => {
  const {
    packages,
    clients,
    services,
    appointments,
    openNewAppointmentModal,
    setSelectedClientForDetails,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');

  const enrichedPackages = useMemo(() => {
    return packages.map((pkg) => {
      const client = clients.find((c) => c.id === pkg.clientId);
      const service = services.find((s) => s.id === pkg.serviceId);

      // Count actual completed appointments
      const pkgApts = appointments.filter(
        (a) => a.clientId === pkg.clientId && a.serviceId === pkg.serviceId && a.status !== 'cancelled'
      );
      const completed = pkgApts.filter((a) => a.status === 'completed').length;
      const scheduled = pkgApts.filter((a) => a.status === 'pending' || a.status === 'in_progress').length;
      const remainingUnbooked = Math.max(0, pkg.totalSessions - (completed + scheduled));
      const nextSessionNumber = Math.min(completed + scheduled + 1, pkg.totalSessions);

      return {
        pkg,
        client,
        service,
        completed,
        scheduled,
        remainingUnbooked,
        nextSessionNumber,
        progressPercent: Math.round((completed / pkg.totalSessions) * 100),
      };
    });
  }, [packages, clients, services, appointments]);

  const filtered = useMemo(() => {
    return enrichedPackages.filter((item) => {
      if (filterStatus !== 'all' && item.pkg.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const clientMatch = item.client?.name.toLowerCase().includes(q) || item.client?.phone.includes(q);
        const serviceMatch = item.service?.name.toLowerCase().includes(q);
        if (!clientMatch && !serviceMatch) return false;
      }
      return true;
    });
  }, [enrichedPackages, filterStatus, searchQuery]);

  const handleBookNext = (item: typeof enrichedPackages[0]) => {
    if (!item.client || !item.service) return;

    openNewAppointmentModal({
      clientId: item.client.id,
      serviceId: item.service.id,
      sessionNumber: item.nextSessionNumber,
      totalSessions: item.pkg.totalSessions,
      packageId: item.pkg.id,
      notes: `Sesión ${item.nextSessionNumber} de ${item.pkg.totalSessions} del paquete`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Control de Bonos y Tratamientos
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Gestión de Paquetes Multisesión
          </h2>
          <p className="text-xs text-slate-500">
            Supervisa el avance de sesiones de cada cliente y agenda la siguiente cita con 1 clic.
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Paquetes Activos</span>
            <span className="text-lg font-extrabold text-indigo-600 font-mono tabular-nums">
              {packages.filter((p) => p.status === 'active').length}
            </span>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-xs">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Sesiones Pendientes</span>
            <span className="text-lg font-extrabold text-amber-600 font-mono tabular-nums">
              {enrichedPackages.reduce((acc, item) => acc + item.remainingUnbooked, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cliente, teléfono o nombre del tratamiento..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1">
          {(['active', 'all', 'completed'] as const).map((status) => {
            const labels = { active: 'Activos', all: 'Todos', completed: 'Completados' };
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {labels[status]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const { pkg, client, service, completed, scheduled, remainingUnbooked, nextSessionNumber, progressPercent } = item;
          if (!client || !service) return null;

          return (
            <div
              key={pkg.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Client & Category */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {service.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedClientForDetails(client)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block mt-1 text-left"
                    >
                      {client.name}
                    </button>
                    <span className="text-xs text-slate-500 font-mono">
                      {client.phone}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      pkg.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {pkg.status === 'active' ? 'En Curso' : 'Finalizado'}
                  </span>
                </div>

                {/* Treatment Name */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                  <h4 className="text-xs font-bold text-slate-800">
                    {service.name}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span>Duración: {service.duration} min/sesión</span>
                    <span className="font-semibold text-slate-700">
                      Iniciado: {pkg.startDate}
                    </span>
                  </div>
                </div>

                {/* Progress Visual */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Avance de sesiones:
                    </span>
                    <span className="font-bold text-slate-900 font-mono tabular-nums">
                      {completed} de {pkg.totalSessions} completadas ({progressPercent}%)
                    </span>
                  </div>

                  {/* Multistep session bars */}
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: pkg.totalSessions }).map((_, i) => {
                      const num = i + 1;
                      const isDone = num <= completed;
                      const isScheduled = num > completed && num <= completed + scheduled;

                      return (
                        <div
                          key={i}
                          className={`h-2.5 rounded-full transition-all ${
                            isDone
                              ? 'bg-emerald-500'
                              : isScheduled
                              ? 'bg-indigo-400'
                              : 'bg-slate-200'
                          }`}
                          title={`Sesión ${num}: ${isDone ? 'Completada' : isScheduled ? 'Agendada' : 'Pendiente'}`}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      {completed} Hechas
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                      {scheduled} Agendadas
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-amber-700">
                      <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                      {remainingUnbooked} por agendar
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedClientForDetails(client)}
                  className="text-xs text-slate-600 hover:text-indigo-600 font-semibold"
                >
                  Ver Ficha CRM
                </button>

                {remainingUnbooked > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleBookNext(item)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CalendarPlus className="w-3.5 h-3.5" />
                    Agendar Sesión {nextSessionNumber}
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    ✓ Paquete completo
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs">
          No se encontraron paquetes multisesión con los criterios seleccionados.
        </div>
      )}
    </div>
  );
};
