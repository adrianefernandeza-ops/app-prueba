import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Client,
  Service,
  Staff,
  Appointment,
  ClientPackage,
  BusinessConfig,
  AppointmentStatus,
  ToastNotification,
  ConfirmDialogConfig,
} from '../types';
import {
  INITIAL_BUSINESS_CONFIG,
  INITIAL_SERVICES,
  INITIAL_STAFF,
  INITIAL_CLIENTS,
  INITIAL_PACKAGES,
  generateInitialAppointments,
} from '../data/mockData';

interface NextSessionPromptInfo {
  appointment: Appointment;
  client: Client;
  service: Service;
  remainingSessions: number;
  nextSessionNumber: number;
}

interface AppContextType {
  // Data
  services: Service[];
  staff: Staff[];
  clients: Client[];
  packages: ClientPackage[];
  appointments: Appointment[];
  businessConfig: BusinessConfig;

  // View state
  activeTab: 'calendar' | 'packages' | 'clients' | 'services' | 'staff' | 'settings';
  setActiveTab: (tab: 'calendar' | 'packages' | 'clients' | 'services' | 'staff' | 'settings') => void;
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (date: string) => void;
  selectedStaffFilter: string; // 'all' or staffId
  setSelectedStaffFilter: (id: string) => void;
  calendarMode: 'daily' | 'weekly' | 'list';
  setCalendarMode: (mode: 'daily' | 'weekly' | 'list') => void;

  // Modals & UI triggers
  isNewAppointmentModalOpen: boolean;
  openNewAppointmentModal: (preset?: Partial<Appointment>) => void;
  closeNewAppointmentModal: () => void;
  newAppointmentPreset?: Partial<Appointment>;

  isNextSessionPromptOpen: boolean;
  nextSessionPromptInfo: NextSessionPromptInfo | null;
  closeNextSessionPrompt: () => void;
  confirmScheduleNextSession: () => void;

  selectedAppointmentForDetails: Appointment | null;
  setSelectedAppointmentForDetails: (apt: Appointment | null) => void;

  selectedClientForDetails: Client | null;
  setSelectedClientForDetails: (client: Client | null) => void;

  selectedAppointmentForWhatsApp: Appointment | null;
  setSelectedAppointmentForWhatsApp: (apt: Appointment | null) => void;

  // Feedback Notifications & Dialogs (No window.alert / confirm)
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  confirmDialog: ConfirmDialogConfig | null;
  showConfirm: (config: ConfirmDialogConfig) => void;
  closeConfirm: () => void;

  // Actions
  addAppointment: (data: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  changeAppointmentStatus: (id: string, newStatus: AppointmentStatus) => void;

  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addService: (data: Omit<Service, 'id'>) => Service;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addStaff: (data: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  updateBusinessConfig: (updates: Partial<BusinessConfig>) => void;
  resetToMockData: () => void;

  // Helpers
  getClientById: (id: string) => Client | undefined;
  getServiceById: (id: string) => Service | undefined;
  getStaffById: (id: string) => Staff | undefined;
  calculateMultisessionInfo: (clientId: string, serviceId: string) => {
    isMulti: boolean;
    sessionNumber: number;
    totalSessions: number;
    remainingSessions: number;
    packageId?: string;
    isNewPackage: boolean;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SERVICES: 'agendapro_services_v1',
  STAFF: 'agendapro_staff_v1',
  CLIENTS: 'agendapro_clients_v1',
  PACKAGES: 'agendapro_packages_v1',
  APPOINTMENTS: 'agendapro_appointments_v1',
  CONFIG: 'agendapro_config_v1',
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with localStorage or defaults
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [packages, setPackages] = useState<ClientPackage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : generateInitialAppointments();
  });

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_CONFIG;
  });

  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'calendar' | 'packages' | 'clients' | 'services' | 'staff' | 'settings'>('calendar');
  
  // Default date to today formatted YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('all');
  const [calendarMode, setCalendarMode] = useState<'daily' | 'weekly' | 'list'>('daily');

  // Modals
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [newAppointmentPreset, setNewAppointmentPreset] = useState<Partial<Appointment> | undefined>();

  const [isNextSessionPromptOpen, setIsNextSessionPromptOpen] = useState(false);
  const [nextSessionPromptInfo, setNextSessionPromptInfo] = useState<NextSessionPromptInfo | null>(null);

  const [selectedAppointmentForDetails, setSelectedAppointmentForDetails] = useState<Appointment | null>(null);
  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [selectedAppointmentForWhatsApp, setSelectedAppointmentForWhatsApp] = useState<Appointment | null>(null);

  // Toasts and custom confirmation dialog
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogConfig | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showConfirm = (config: ConfirmDialogConfig) => {
    setConfirmDialog(config);
  };

  const closeConfirm = () => {
    setConfirmDialog(null);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(businessConfig));
  }, [businessConfig]);

  // Lookup helpers
  const getClientById = (id: string) => clients.find((c) => c.id === id);
  const getServiceById = (id: string) => services.find((s) => s.id === id);
  const getStaffById = (id: string) => staff.find((st) => st.id === id);

  // Multisesión calculation helper
  const calculateMultisessionInfo = (clientId: string, serviceId: string) => {
    const srv = getServiceById(serviceId);
    if (!srv || srv.type !== 'multi') {
      return {
        isMulti: false,
        sessionNumber: 1,
        totalSessions: 1,
        remainingSessions: 0,
        isNewPackage: false,
      };
    }

    const total = srv.totalSessions || 1;
    // Find active package for client & service
    const clientPackage = packages.find(
      (p) => p.clientId === clientId && p.serviceId === serviceId && p.status === 'active'
    );

    if (clientPackage) {
      // Find appointments for this package/service to see highest sessionNumber
      const relatedApts = appointments.filter(
        (a) => a.clientId === clientId && a.serviceId === serviceId && a.status !== 'cancelled'
      );
      const completedCount = relatedApts.filter((a) => a.status === 'completed').length;
      const scheduledCount = relatedApts.length;

      // Next session to schedule is completed/scheduled + 1, capped at total
      const nextSession = Math.min(scheduledCount + 1, total);
      const remaining = Math.max(0, total - scheduledCount);

      return {
        isMulti: true,
        sessionNumber: nextSession,
        totalSessions: total,
        remainingSessions: remaining,
        packageId: clientPackage.id,
        isNewPackage: false,
      };
    } else {
      // Check if client has previous appointments without package entry
      const relatedApts = appointments.filter(
        (a) => a.clientId === clientId && a.serviceId === serviceId && a.status !== 'cancelled'
      );
      const nextSession = Math.min(relatedApts.length + 1, total);
      const remaining = Math.max(0, total - relatedApts.length);

      return {
        isMulti: true,
        sessionNumber: nextSession,
        totalSessions: total,
        remainingSessions: remaining,
        isNewPackage: relatedApts.length === 0,
      };
    }
  };

  // Appointment operations
  const addAppointment = (data: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const srv = getServiceById(data.serviceId);
    let packageId = data.packageId;

    // If multi-session, create or update package
    if (srv && srv.type === 'multi') {
      let existingPkg = packages.find(
        (p) => p.clientId === data.clientId && p.serviceId === data.serviceId && p.status === 'active'
      );

      if (!existingPkg) {
        // Create new package
        const newPkg: ClientPackage = {
          id: `pkg-${Date.now()}`,
          clientId: data.clientId,
          serviceId: data.serviceId,
          totalSessions: srv.totalSessions,
          completedSessions: 0,
          scheduledSessions: 1,
          status: 'active',
          startDate: data.date,
        };
        setPackages((prev) => [newPkg, ...prev]);
        packageId = newPkg.id;
      } else {
        packageId = existingPkg.id;
        setPackages((prev) =>
          prev.map((p) =>
            p.id === existingPkg!.id
              ? { ...p, scheduledSessions: p.scheduledSessions + 1 }
              : p
          )
        );
      }
    }

    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      packageId,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, ...updates } : apt))
    );
  };

  // Status changer with automatic multisesion prompt trigger!
  const changeAppointmentStatus = (id: string, newStatus: AppointmentStatus) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    const previousStatus = apt.status;
    const updatedApt = { ...apt, status: newStatus };

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? updatedApt : a))
    );

    const srv = getServiceById(apt.serviceId);
    const client = getClientById(apt.clientId);

    // Update package counts if applicable
    if (apt.packageId && srv && srv.type === 'multi') {
      setPackages((prev) =>
        prev.map((pkg) => {
          if (pkg.id === apt.packageId) {
            let completed = pkg.completedSessions;
            if (previousStatus !== 'completed' && newStatus === 'completed') {
              completed = Math.min(completed + 1, pkg.totalSessions);
            } else if (previousStatus === 'completed' && newStatus !== 'completed') {
              completed = Math.max(completed - 1, 0);
            }
            return {
              ...pkg,
              completedSessions: completed,
              status: completed >= pkg.totalSessions ? 'completed' : 'active',
            };
          }
          return pkg;
        })
      );
    }

    // CHECK FOR MULTISESSION PROMPT:
    // If appointment is just marked as 'completed' and is a multi-session service
    if (newStatus === 'completed' && srv && srv.type === 'multi' && client) {
      const currentSession = apt.sessionNumber || 1;
      const totalSessions = apt.totalSessions || srv.totalSessions;
      
      // Calculate how many total sessions are already booked or completed
      const allClientServiceApts = appointments
        .filter((a) => a.clientId === client.id && a.serviceId === srv.id && a.id !== apt.id && a.status !== 'cancelled');
      
      const futureOrRemainingSessions = totalSessions - (1 + allClientServiceApts.length);
      const remainingToTarget = totalSessions - currentSession;

      // If there are still sessions remaining in the package (or no future session is yet booked)
      if (currentSession < totalSessions) {
        const nextSessionNum = currentSession + 1;
        setNextSessionPromptInfo({
          appointment: updatedApt,
          client,
          service: srv,
          remainingSessions: Math.max(1, remainingToTarget),
          nextSessionNumber: nextSessionNum,
        });
        setIsNextSessionPromptOpen(true);
      }
    }
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  // Client operations
  const addClient = (data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...data,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Service operations
  const addService = (data: Omit<Service, 'id'>): Service => {
    const newService: Service = {
      ...data,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newService]);
    return newService;
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Staff operations
  const addStaff = (data: Omit<Staff, 'id'>): Staff => {
    const newStaff: Staff = {
      ...data,
      id: `stf-${Date.now()}`,
    };
    setStaff((prev) => [...prev, newStaff]);
    return newStaff;
  };

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaff((prev) =>
      prev.map((st) => (st.id === id ? { ...st, ...updates } : st))
    );
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((st) => st.id !== id));
  };

  const updateBusinessConfig = (updates: Partial<BusinessConfig>) => {
    setBusinessConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetToMockData = () => {
    setServices(INITIAL_SERVICES);
    setStaff(INITIAL_STAFF);
    setClients(INITIAL_CLIENTS);
    setPackages(INITIAL_PACKAGES);
    setAppointments(generateInitialAppointments());
    setBusinessConfig(INITIAL_BUSINESS_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    localStorage.removeItem(STORAGE_KEYS.STAFF);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.PACKAGES);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEYS.CONFIG);
  };

  // Modal Openers
  const openNewAppointmentModal = (preset?: Partial<Appointment>) => {
    setNewAppointmentPreset(preset);
    setIsNewAppointmentModalOpen(true);
  };

  const closeNewAppointmentModal = () => {
    setIsNewAppointmentModalOpen(false);
    setNewAppointmentPreset(undefined);
  };

  const closeNextSessionPrompt = () => {
    setIsNextSessionPromptOpen(false);
    setNextSessionPromptInfo(null);
  };

  // When user clicks "Agendar siguiente sesión ahora" in the prompt modal:
  const confirmScheduleNextSession = () => {
    if (!nextSessionPromptInfo) return;
    const { appointment, client, service, nextSessionNumber } = nextSessionPromptInfo;
    
    // Calculate suggested next date (+7 days from current appointment)
    const baseDate = new Date(appointment.date);
    baseDate.setDate(baseDate.getDate() + 7);
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const suggestedDate = `${year}-${month}-${day}`;

    closeNextSessionPrompt();

    // Open booking modal with pre-filled client, service, staff, session number, suggested date/time
    openNewAppointmentModal({
      clientId: client.id,
      serviceId: service.id,
      staffId: appointment.staffId,
      packageId: appointment.packageId,
      sessionNumber: nextSessionNumber,
      totalSessions: service.totalSessions,
      date: suggestedDate,
      startTime: appointment.startTime,
      notes: `Sesión ${nextSessionNumber} de ${service.totalSessions} (Agendada tras completar sesión ${appointment.sessionNumber || 1})`,
    });
  };

  const contextValue: AppContextType = {
    services,
    staff,
    clients,
    packages,
    appointments,
    businessConfig,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    selectedStaffFilter,
    setSelectedStaffFilter,
    calendarMode,
    setCalendarMode,
    isNewAppointmentModalOpen,
    openNewAppointmentModal,
    closeNewAppointmentModal,
    newAppointmentPreset,
    isNextSessionPromptOpen,
    nextSessionPromptInfo,
    closeNextSessionPrompt,
    confirmScheduleNextSession,
    selectedAppointmentForDetails,
    setSelectedAppointmentForDetails,
    selectedClientForDetails,
    setSelectedClientForDetails,
    selectedAppointmentForWhatsApp,
    setSelectedAppointmentForWhatsApp,
    toasts,
    showToast,
    removeToast,
    confirmDialog,
    showConfirm,
    closeConfirm,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    changeAppointmentStatus,
    addClient,
    updateClient,
    deleteClient,
    addService,
    updateService,
    deleteService,
    addStaff,
    updateStaff,
    deleteStaff,
    updateBusinessConfig,
    resetToMockData,
    getClientById,
    getServiceById,
    getStaffById,
    calculateMultisessionInfo,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
