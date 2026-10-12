import React from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { AppointmentCard } from './AppointmentCard';
import { Clock, Plus, User, Sparkles } from 'lucide-react';

export const DailyView: React.FC = () => {
  const {
    appointments,
    selectedDate,
    selectedStaffFilter,
    staff,
    openNewAppointmentModal,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;

  // Filter appointments for selectedDate and staff
  const dailyAppointments = appointments.filter((apt) => {
    if (apt.date !== selectedDate) return false;
    if (selectedStaffFilter !== 'all' && apt.staffId !== selectedStaffFilter) return false;
    return true;
  });

  // Hours range from 08:00 to 20:00
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8, 9, 10, ... 20

  const handleSlotClick = (hour: number) => {
    const timeStr = `${String(hour).padStart(2, '0')}:00`;
    openNewAppointmentModal({
      date: selectedDate,
      startTime: timeStr,
      staffId: selectedStaffFilter !== 'all' ? selectedStaffFilter : undefined,
    });
  };

  const now = new Date();
  const currentHour = now.getHours();

  return (
    <div className="space-y-4">
      {/* Hourly Schedule Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100">
          {hours.map((hour) => {
            const hourString = `${String(hour).padStart(2, '0')}:00`;
            const isCurrentHourSlot = isToday && hour === currentHour;

            // Find appointments starting in this hour (e.g. 10:00 - 10:59)
            const hourApts = dailyAppointments.filter((apt) => {
              const aptHour = parseInt(apt.startTime.split(':')[0], 10);
              return aptHour === hour;
            });

            return (
              <div
                key={hour}
                className={`group relative flex flex-col sm:flex-row items-stretch min-h-[92px] transition-colors ${
                  isCurrentHourSlot ? 'bg-indigo-50/20' : 'hover:bg-slate-50/40'
                }`}
              >
                {/* Live Current Time Red Marker if viewing today */}
                {isCurrentHourSlot && (
                  <div className="absolute top-0 left-0 right-0 z-10 flex items-center pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white ml-20 sm:ml-23" />
                    <div className="flex-1 h-0.5 bg-rose-500/70" />
                  </div>
                )}

                {/* Hour label */}
                <div className="sm:w-26 shrink-0 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50 flex sm:flex-col justify-between items-start sm:items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800 tabular-nums">
                      {hourString}
                    </span>
                    {isCurrentHourSlot && (
                      <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 uppercase">
                        Ahora
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSlotClick(hour)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 mt-2"
                    title="Agendar a esta hora"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Cita</span>
                  </button>
                </div>

                {/* Appointment cards slot */}
                <div className="flex-1 p-3">
                  {hourApts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {hourApts.map((apt) => (
                        <AppointmentCard key={apt.id} appointment={apt} />
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={() => handleSlotClick(hour)}
                      className="h-full min-h-[56px] rounded-xl border border-dashed border-transparent hover:border-indigo-200 hover:bg-indigo-50/30 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <span className="text-xs text-slate-400 group-hover:text-indigo-600 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3.5 h-3.5" /> + Agendar cita en este horario ({hourString})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
