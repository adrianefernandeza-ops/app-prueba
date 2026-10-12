import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AppointmentCard } from './AppointmentCard';
import { Plus, Calendar } from 'lucide-react';

export const WeeklyView: React.FC = () => {
  const {
    appointments,
    selectedDate,
    setSelectedDate,
    selectedStaffFilter,
    openNewAppointmentModal,
  } = useApp();

  // Calculate the 7 days of the week for selectedDate (Monday to Sunday)
  const weekDays = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const curr = new Date(year, month - 1, day);
    
    // Day of week: 0 is Sun, 1 is Mon... convert so Mon is 0
    const dayOfWeek = (curr.getDay() + 6) % 7; // Mon=0, Sun=6
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dt = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dt}`;
      
      const dayName = d.toLocaleDateString('es-ES', { weekday: 'short' });
      return {
        dateStr,
        dayNumber: d.getDate(),
        dayName: dayName.toUpperCase(),
        isToday: dateStr === new Date().toISOString().split('T')[0],
        isSelected: dateStr === selectedDate,
      };
    });
  }, [selectedDate]);

  return (
    <div className="space-y-3">
      {/* Responsive weekly layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          // Filter appointments for this day
          const dayApts = appointments
            .filter((apt) => {
              if (apt.date !== day.dateStr) return false;
              if (selectedStaffFilter !== 'all' && apt.staffId !== selectedStaffFilter) return false;
              return true;
            })
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div
              key={day.dateStr}
              className={`flex flex-col bg-white border rounded-2xl overflow-hidden min-h-[460px] transition-all ${
                day.isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 shadow-2xs'
              }`}
            >
              {/* Day header */}
              <div
                onClick={() => setSelectedDate(day.dateStr)}
                className={`p-3 border-b text-center cursor-pointer transition-colors ${
                  day.isToday
                    ? 'bg-indigo-600 text-white'
                    : day.isSelected
                    ? 'bg-indigo-50 text-indigo-950 border-indigo-200'
                    : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span className={`text-[11px] font-bold block tracking-wider ${day.isToday ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {day.dayName}
                </span>
                <span className="text-xl font-extrabold font-mono tabular-nums block">
                  {day.dayNumber}
                </span>
                <span className={`text-[11px] font-medium block mt-0.5 ${day.isToday ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {dayApts.length} {dayApts.length === 1 ? 'cita' : 'citas'}
                </span>
              </div>

              {/* Day appointments list */}
              <div className="flex-1 p-2 space-y-2 bg-slate-50/30 overflow-y-auto max-h-[600px]">
                {dayApts.length > 0 ? (
                  dayApts.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} compact />
                  ))
                ) : (
                  <div className="py-12 text-center text-[11px] text-slate-400 font-medium">
                    Sin citas
                  </div>
                )}
              </div>

              {/* Add button at bottom of day column */}
              <div className="p-2 border-t border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={() =>
                    openNewAppointmentModal({
                      date: day.dateStr,
                      startTime: '10:00',
                      staffId: selectedStaffFilter !== 'all' ? selectedStaffFilter : undefined,
                    })
                  }
                  className="w-full py-1.5 px-2 text-[11px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Añadir cita</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
