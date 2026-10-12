import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  CalendarPlus,
  Clock,
  Sparkles,
  Calendar,
  Search,
  User,
  X,
  Phone,
  PackageCheck,
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    activeTab,
    openNewAppointmentModal,
    businessConfig,
    selectedDate,
    appointments,
    clients,
    packages,
    setSelectedClientForDetails,
  } = useApp();

  const [headerSearch, setHeaderSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'calendar':
        return 'Agenda & Control de Citas';
      case 'packages':
        return 'Paquetes Multisesión & Bonos';
      case 'clients':
        return 'Directorio de Clientes (CRM)';
      case 'services':
        return 'Catálogo de Servicios';
      case 'staff':
        return 'Especialistas & Equipo';
      case 'settings':
        return 'Ajustes de Recepción';
      default:
        return 'Recepción';
    }
  };

  const todayCount = appointments.filter((a) => a.date === selectedDate).length;

  const searchResults = React.useMemo(() => {
    if (!headerSearch.trim()) return [];
    const q = headerSearch.toLowerCase();
    return clients
      .filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q))
      .slice(0, 5);
  }, [clients, headerSearch]);

  const handleSelectClientResult = (client: any) => {
    setSelectedClientForDetails(client);
    setHeaderSearch('');
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
      {/* Left zone: Mobile toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="truncate">{businessConfig.name}</span>
            <span className="text-slate-300">/</span>
            <span className="text-indigo-600 font-semibold">{getBreadcrumbTitle()}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {getBreadcrumbTitle()}
          </h1>
        </div>
      </div>

      {/* Middle zone: Reception Quick Client Search */}
      <div className="relative hidden md:block max-w-xs w-full" ref={searchRef}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => {
              setHeaderSearch(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Buscar cliente en recepción..."
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          {headerSearch && (
            <button
              onClick={() => setHeaderSearch('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown search results */}
        {isSearchOpen && headerSearch.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100 animate-in fade-in duration-100">
            {searchResults.length > 0 ? (
              searchResults.map((cli) => {
                const clientPackages = packages.filter((p) => p.clientId === cli.id && p.status === 'active');

                return (
                  <button
                    key={cli.id}
                    type="button"
                    onClick={() => handleSelectClientResult(cli)}
                    className="w-full text-left p-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{cli.name}</span>
                      <span className="font-mono text-[11px] text-slate-500">{cli.phone}</span>
                    </div>

                    {clientPackages.length > 0 && (
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                        {clientPackages.length} bono activo
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-slate-500">
                No se encontraron clientes con "{headerSearch}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right zone: Date summary + Primary Action CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-slate-700 tabular-nums">
            {selectedDate}
          </span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 font-medium tabular-nums">
            {todayCount} {todayCount === 1 ? 'cita' : 'citas'}
          </span>
        </div>

        {/* PWA Install Button */}
        <PWAInstallButton compact />

        {/* Primary CTA */}
        <button
          type="button"
          onClick={() => openNewAppointmentModal()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
        >
          <CalendarPlus className="w-4 h-4" />
          <span className="hidden sm:inline">+ Nueva Cita</span>
          <span className="sm:hidden">+ Cita</span>
        </button>
      </div>
    </header>
  );
};
