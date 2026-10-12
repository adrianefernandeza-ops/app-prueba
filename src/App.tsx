import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CalendarView } from './components/calendar/CalendarView';
import { PackagesView } from './components/packages/PackagesView';
import { ClientsView } from './components/clients/ClientsView';
import { ServicesView } from './components/services/ServicesView';
import { StaffView } from './components/staff/StaffView';
import { SettingsView } from './components/settings/SettingsView';

import { NewAppointmentModal } from './components/modals/NewAppointmentModal';
import { NextSessionPromptModal } from './components/modals/NextSessionPromptModal';
import { WhatsAppModal } from './components/modals/WhatsAppModal';
import { AppointmentDetailsModal } from './components/modals/AppointmentDetailsModal';
import { ClientDetailModal } from './components/clients/ClientDetailModal';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { OfflineIndicator } from './components/common/OfflineIndicator';

const DashboardContent: React.FC = () => {
  const { activeTab } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased text-slate-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'packages' && <PackagesView />}
          {activeTab === 'clients' && <ClientsView />}
          {activeTab === 'services' && <ServicesView />}
          {activeTab === 'staff' && <StaffView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Prompts */}
      <NewAppointmentModal />
      <NextSessionPromptModal />
      <WhatsAppModal />
      <AppointmentDetailsModal />
      <ClientDetailModal />
      <ConfirmDialog />
      <ToastContainer />
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
