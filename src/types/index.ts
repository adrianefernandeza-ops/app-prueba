export type ServiceType = 'single' | 'multi';

export type AppointmentStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  type: ServiceType;
  totalSessions: number; // 1 for single, N for multi
  price: number;
  category: string;
  color: string;
  description?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone?: string;
  color: string;
  avatar?: string;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface ClientPackage {
  id: string;
  clientId: string;
  serviceId: string;
  totalSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  staffId: string;
  packageId?: string; // Links to a package if multi-session
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (e.g., '09:30')
  endTime: string; // HH:MM (e.g., '10:30')
  status: AppointmentStatus;
  sessionNumber?: number; // e.g., 3
  totalSessions?: number; // e.g., 7
  notes?: string;
  createdAt: string;
}

export interface BusinessConfig {
  name: string;
  phone: string;
  address: string;
  whatsappTemplate: string;
  currency: string;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface ConfirmDialogConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

