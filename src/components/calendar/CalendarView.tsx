import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyView } from './DailyView';
import { WeeklyView } from './WeeklyView';
import { ListView } from './ListView';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Users,
  Clock,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { downloadICSFile } from '../../utils/calendarExport';

export const CalendarView: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    selectedStaffFilter,
    setSelectedStaffFilter,
    calendarMode,
    setCalendarMode,
    staff,
    appointments,
    getClientById,
    getServiceById,
    getStaffById,
    businessConfig,
    showToast,
  } = useApp();

  // Navigation handlers
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - (calendarMode === 'weekly' ? 7 : 1));
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + (calendarMode === 'weekly' ? 7 : 1));
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Formatted date string in human Spanish
  const formattedDisplayDate = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDate]);

  // Daily metrics
  const dayAppointments = useMemo(
    () => appointments.filter((a) => a.date === selectedDate),
    [appointments, selectedDate]
  );

  const completedCount = dayAppointments.filter((a) => a.status === 'completed').length;
  const inProgressCount = dayAppointments.filter((a) => a.status === 'in_progress').length;
  const pendingCount = dayAppointments.filter((a) => a.status === 'pending').length;

  const estimatedRevenue = useMemo(() => {
    return dayAppointments
      .filter((a) => a.status !== 'cancelled')
      .reduce((acc, a) => {
        const srv = getServiceById(a.serviceId);
        return acc + (srv ? srv.price : 0);
      }, 0);
  }, [dayAppointments, getServiceById]);

  const multiSessionDayCount = useMemo(() => {
    return dayAppointments.filter((a) => {
      const srv = getServiceById(a.serviceId);
      return srv?.type === 'multi';
    }).length;
  }, [dayAppointments, getServiceById]);

  // Export current day's appointments to .ics
  const handleExportDayICS = () => {
    if (dayAppointments.length === 0) {
      showToast('No hay citas en este día para exportar.', 'info');
      return;
    }

    const exportBundle = dayAppointments
      .map((a) => {
        const client = getClientById(a.clientId);
        const service = getServiceById(a.serviceId);
        const st = getStaffById(a.staffId);
        if (!client || !service) return null;
        return { appointment: a, client, service, staff: st };
      })
      .filter(Boolean) as Array<{ appointment: any; client: any; service: any; staff?: any }>;

    downloadICSFile(exportBundle, businessConfig, `agenda-${selectedDate}.ics`);
    showToast(
      `Exportadas ${dayAppointments.length} citas para Google Calendar / Apple Calendar`,
      'success'
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Reception Summary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Appointments */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Citas del Día
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                {dayAppointments.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({pendingCount} pendientes)
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Progress / Completed */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Atención en Cabina
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-emerald-600 font-mono tabular-nums">
                {completedCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {inProgressCount > 0 ? `· ${inProgressCount} en curso` : 'finalizadas'}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Multisesión bonos hoy */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Bonos Multisesión
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-extrabold text-purple-600 font-mono tabular-nums">
                {multiSessionDayCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                sesiones programadas
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Estimated Revenue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
              Facturación Estimada
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                {estimatedRevenue}
              </span>
              <span className="text-xs font-bold text-slate-600">
                {businessConfig.currency}
              </span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Top Calendar Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Date Jump & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              type="button"
              onClick={handlePrevDay}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Día/Semana anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
            >
              HOY
            </button>
            <button
              type="button"
              onClick={handleNextDay}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
              title="Día/Semana siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-medium border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          />

          {/* Current Date Display */}
          <h2 className="text-sm sm:text-base font-bold text-slate-900 capitalize pl-1">
            {formattedDisplayDate}
          </h2>
        </div>

        {/* Right side: View modes & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Segmented Controls */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setCalendarMode('daily')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                calendarMode === 'daily'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diario
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('weekly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                calendarMode === 'weekly'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('list')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                calendarMode === 'list'
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lista del día
            </button>
          </div>

          {/* ICS Export Button */}
          <button
            type="button"
            onClick={handleExportDayICS}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Exportar citas del día a Google Calendar (.ics)"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Exportar Google Cal</span>
          </button>
        </div>
      </div>

      {/* 3. Specialist Filter Ribbon (Clickable chips with workload) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 shrink-0 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          Filtrar:
        </span>

        {/* All Specialists Button */}
        <button
          type="button"
          onClick={() => setSelectedStaffFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            selectedStaffFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs font-bold'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>Todos los Especialistas</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums ${
              selectedStaffFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}
          >
            {dayAppointments.length}
          </span>
        </button>

        {/* Specialist Individual Chips */}
        {staff.map((st) => {
          const isSelected = selectedStaffFilter === st.id;
          const staffAptsToday = dayAppointments.filter((a) => a.staffId === st.id).length;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStaffFilter(isSelected ? 'all' : st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 border ${
                isSelected
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: st.color }}
              />
              <span>{st.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold tabular-nums ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {staffAptsToday}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Active View Content */}
      {calendarMode === 'daily' && <DailyView />}
      {calendarMode === 'weekly' && <WeeklyView />}
      {calendarMode === 'list' && <ListView />}
    </div>
  );
};
