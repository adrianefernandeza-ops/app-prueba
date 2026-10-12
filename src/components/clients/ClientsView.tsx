import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Search,
  UserPlus,
  Phone,
  Mail,
  Calendar,
  PackageCheck,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { Client } from '../../types';

export const ClientsView: React.FC = () => {
  const {
    clients,
    appointments,
    packages,
    addClient,
    setSelectedClientForDetails,
    openNewAppointmentModal,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const enrichedClients = useMemo(() => {
    return clients.map((client) => {
      const clientApts = appointments.filter((a) => a.clientId === client.id);
      const clientPackages = packages.filter((p) => p.clientId === client.id && p.status === 'active');
      const lastApt = [...clientApts].sort((a, b) => b.date.localeCompare(a.date))[0];

      return {
        ...client,
        totalAppointments: clientApts.length,
        activePackagesCount: clientPackages.length,
        lastAppointmentDate: lastApt ? lastApt.date : null,
      };
    });
  }, [clients, appointments, packages]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return enrichedClients;
    const q = searchQuery.toLowerCase();
    return enrichedClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [enrichedClients, searchQuery]);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const created = addClient({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    setIsCreatingClient(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
    showToast(`Cliente "${created.name}" registrado con éxito en recepción`, 'success');
    setSelectedClientForDetails(created);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Recepción & CRM
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            Directorio de Clientes
          </h2>
          <p className="text-xs text-slate-500">
            Base de datos interna con historial clínico, preferencias y control de bonos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingClient(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          + Registrar Nuevo Cliente
        </button>
      </div>

      {/* Inline Create Form Modal */}
      {isCreatingClient && (
        <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Nuevo Registro de Cliente en Recepción
            </h3>
            <button
              type="button"
              onClick={() => setIsCreatingClient(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateClient} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nombre y Apellidos *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej. María Fernanda Lozano"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Teléfono (WhatsApp) *</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Ej. +34 611 889 900"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email (Opcional)</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="maria@ejemplo.com"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Notas Internas (alergias, piel, horario)</label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Ej. Piel atópica, suele llegar puntual"
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingClient(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
              >
                Guardar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar cliente por nombre, teléfono o email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Clients Table / List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Paquetes Activos</th>
                <th className="py-3 px-4">Historial</th>
                <th className="py-3 px-4">Notas Recepción</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((client) => {
                const cleanPhone = client.phone.replace(/[^\d+]/g, '').replace(/^\+/, '');

                return (
                  <tr
                    key={client.id}
                    onClick={() => setSelectedClientForDetails(client)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Name */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block text-sm">
                        {client.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Alta: {client.createdAt}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-medium text-slate-800 block">
                        {client.phone}
                      </span>
                      {client.email && (
                        <span className="text-slate-500 text-[11px] block">
                          {client.email}
                        </span>
                      )}
                    </td>

                    {/* Active Packages */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {client.activePackagesCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md tabular-nums">
                          <PackageCheck className="w-3.5 h-3.5 text-indigo-600" />
                          {client.activePackagesCount} {client.activePackagesCount === 1 ? 'bono activo' : 'bonos activos'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Sin bonos</span>
                      )}
                    </td>

                    {/* Total Appointments */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800 tabular-nums">
                        {client.totalAppointments} {client.totalAppointments === 1 ? 'cita' : 'citas'}
                      </span>
                      {client.lastAppointmentDate && (
                        <span className="text-[11px] text-slate-400 block">
                          Última: {client.lastAppointmentDate}
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      {client.notes ? (
                        <span className="text-slate-600 italic text-[11px] truncate block" title={client.notes}>
                          "{client.notes}"
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            openNewAppointmentModal({
                              clientId: client.id,
                            })
                          }
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs"
                          title="Agendar cita para este cliente"
                        >
                          + Cita
                        </button>
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200"
                          title="Abrir chat en WhatsApp"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedClientForDetails(client)}
                          className="p-1.5 text-slate-400 hover:text-slate-700"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No se encontraron clientes con el criterio de búsqueda "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
