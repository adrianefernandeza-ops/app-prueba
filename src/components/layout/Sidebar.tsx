import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  PackageCheck,
  Users,
  Sparkles,
  Scissors,
  Settings,
  CalendarPlus,
  ShieldCheck,
  Clock,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    openNewAppointmentModal,
    appointments,
    packages,
    selectedDate,
    businessConfig,
  } = useApp();

  const todayCount = appointments.filter((a) => a.date === selectedDate).length;
  const activePackagesCount = packages.filter((p) => p.status === 'active').length;

  const navItems = [
    {
      id: 'calendar' as const,
      label: 'Agenda / Calendario',
      icon: Calendar,
      badge: todayCount > 0 ? `${todayCount}` : undefined,
      description: 'Vista diaria, semanal y lista',
    },
    {
      id: 'packages' as const,
      label: 'Paquetes Multisesión',
      icon: PackageCheck,
      badge: activePackagesCount > 0 ? `${activePackagesCount}` : undefined,
      description: 'Control y seguimiento de bonos',
    },
    {
      id: 'clients' as const,
      label: 'Directorio de Clientes',
      icon: Users,
      description: 'CRM e historial de citas',
    },
    {
      id: 'services' as const,
      label: 'Catálogo de Servicios',
      icon: Scissors,
      description: 'Tratamientos y duraciones',
    },
    {
      id: 'staff' as const,
      label: 'Especialistas',
      icon: UserCheck,
      description: 'Equipo de profesionales',
    },
    {
      id: 'settings' as const,
      label: 'Ajustes de Recepción',
      icon: Settings,
      description: 'WhatsApp y configuración',
    },
  ];

  const handleNavClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top brand header */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="truncate">
              <h1 className="text-sm font-bold text-white tracking-tight truncate">
                AgendaPro
              </h1>
              <span className="text-[11px] text-indigo-400 font-semibold tracking-wider uppercase block truncate">
                Panel de Recepción
              </span>
            </div>
          </div>

          {/* Internal-use badge */}
          <div className="mt-4 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Uso exclusivo de recepción</span>
          </div>
        </div>

        {/* Center: "+ Nueva Cita" Button & Navigation links */}
        <div className="px-3 py-4 flex-1 overflow-y-auto space-y-4">
          {/* Main Booking Primary CTA Button */}
          <div className="px-1">
            <button
              type="button"
              onClick={() => {
                openNewAppointmentModal();
                onClose();
              }}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>+ Nueva Cita</span>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                        isActive
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom reception profile & business indicator */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-400">
              RX
            </div>
            <div className="truncate text-xs">
              <span className="font-semibold text-slate-200 block truncate">
                {businessConfig.name}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">
                Recepción Activa
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
