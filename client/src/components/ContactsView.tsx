import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Tag,
  Mail,
  Phone,
  Bot,
  Calendar,
  Sparkles,
  ChevronRight,
  Cake,
  Building
} from 'lucide-react';
import { Contact, PipelineStage } from '../types';

interface ContactsViewProps {
  contacts: Contact[];
  stages: PipelineStage[];
  onSelectContact: (contact: Contact) => void;
  onOpenNewLead: () => void;
  onOpenMessage: (contact: Contact) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  stages,
  onSelectContact,
  onOpenNewLead,
  onOpenMessage
}) => {
  const [search, setSearch] = useState('');
  const [selectedSmartList, setSelectedSmartList] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');

  const smartLists = [
    { id: 'all', label: 'Todos los Contactos' },
    { id: 'Leads de Alta Prioridad', label: 'Alta Prioridad' },
    { id: 'Leads de Instagram', label: 'Instagram' },
    { id: 'Clientes VIP', label: 'Clientes VIP' },
    { id: 'Agencias y Partners', label: 'Agencias & Partners' }
  ];

  // Extract all unique tags
  const allTags = Array.from(new Set(contacts.flatMap(c => c.tags || [])));

  // Filter contacts
  const filteredContacts = contacts.filter(c => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.phone.includes(q);

    const matchesList = selectedSmartList === 'all' || c.smartList === selectedSmartList;
    const matchesTag = selectedTag === 'all' || c.tags?.includes(selectedTag);

    return matchesSearch && matchesList && matchesTag;
  });

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Base de Datos Inteligente de Contactos
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              {filteredContacts.length} contactos
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Administra listas inteligentes, etiquetas dinámicas, recordatorios de cumpleaños y seguimiento IA.
          </p>
        </div>

        <button
          onClick={onOpenNewLead}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Añadir Prospecto</span>
        </button>
      </div>

      {/* Smart Lists Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        {smartLists.map(sl => (
          <button
            key={sl.id}
            onClick={() => setSelectedSmartList(sl.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedSmartList === sl.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
            }`}
          >
            {sl.label}
          </button>
        ))}
      </div>

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, empresa, WhatsApp..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Tag Filter */}
        <div className="relative">
          <select
            value={selectedTag}
            onChange={e => setSelectedTag(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Filtrar por Etiqueta (Todas)</option>
            {allTags.map((tg, idx) => (
              <option key={idx} value={tg}>{tg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Empresa</th>
                <th className="py-3 px-4">Etapa Pipeline</th>
                <th className="py-3 px-4">Etiquetas</th>
                <th className="py-3 px-4">Lead Score</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">IA 24/7</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-200">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No se encontraron contactos con los filtros actuales.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => {
                  const stage = stages.find(s => s.id === contact.pipelineStageId);
                  return (
                    <tr
                      key={contact.id}
                      className="hover:bg-gray-800/40 transition cursor-pointer group"
                      onClick={() => onSelectContact(contact)}
                    >
                      {/* Name & Birthday */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                              <span>{contact.firstName} {contact.lastName}</span>
                              {contact.birthDate && (
                                <span title={`Cumpleaños: ${contact.birthDate}`}>
                                  <Cake className="w-3 h-3 text-pink-400" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
                              <span>{contact.email}</span>
                              <span>•</span>
                              <span>{contact.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="py-3.5 px-4 text-gray-300 font-medium">
                        {contact.company || <span className="text-gray-500">-</span>}
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold border inline-block"
                          style={{
                            borderColor: `${stage?.color || '#6366f1'}40`,
                            backgroundColor: `${stage?.color || '#6366f1'}15`,
                            color: stage?.color || '#818cf8'
                          }}
                        >
                          {stage?.name || 'Lead'}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {contact.tags?.slice(0, 2).map((tg, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 text-[10px]"
                            >
                              {tg}
                            </span>
                          ))}
                          {contact.tags?.length > 2 && (
                            <span className="text-[10px] text-gray-500 font-semibold">
                              +{contact.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Lead Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: `${contact.leadScore || 50}%` }}
                            ></div>
                          </div>
                          <span className="font-mono text-xs font-semibold text-gray-300">
                            {contact.leadScore || 50}
                          </span>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-3.5 px-4 font-bold text-emerald-400">
                        ${contact.opportunityValue?.toLocaleString()} USD
                      </td>

                      {/* AI Autopilot */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            contact.aiAutoPilot
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          <Bot className="w-3 h-3" />
                          {contact.aiAutoPilot ? 'Activo' : 'Pausado'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenMessage(contact);
                          }}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold transition"
                        >
                          Mensaje
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
