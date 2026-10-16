import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Building,
  Tag,
  Calendar,
  CheckSquare,
  FileText,
  Bot,
  Plus,
  Send,
  Sparkles,
  Trash2
} from 'lucide-react';
import { Contact, PipelineStage } from '../types';
import { api } from '../api';

interface ContactDetailDrawerProps {
  contact: Contact | null;
  stages: PipelineStage[];
  onClose: () => void;
  onUpdate: () => void;
  onOpenMessage: (contact: Contact) => void;
}

export const ContactDetailDrawer: React.FC<ContactDetailDrawerProps> = ({
  contact,
  stages,
  onClose,
  onUpdate,
  onOpenMessage
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'info'>('notes');
  const [noteText, setNoteText] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!contact) return null;

  const handleStageChange = async (stageId: string) => {
    try {
      await api.moveContactStage(contact.id, stageId);
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAutopilot = async () => {
    try {
      await api.updateContact(contact.id, { aiAutoPilot: !contact.aiAutoPilot });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setLoading(true);
    try {
      await api.addContactNote(contact.id, noteText, 'Carlos Méndez');
      setNoteText('');
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    setLoading(true);
    try {
      await api.addContactTask(contact.id, taskTitle, taskDueDate || new Date().toISOString().slice(0, 10));
      setTaskTitle('');
      setTaskDueDate('');
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md">
            {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {contact.firstName} {contact.lastName}
            </h2>
            <p className="text-xs text-gray-400">{contact.company || 'Sin Empresa'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Action bar */}
      <div className="px-5 py-3 border-b border-gray-800/80 bg-gray-900/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenMessage(contact)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Mensaje</span>
          </button>
          <button
            onClick={handleToggleAutopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
              contact.aiAutoPilot
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-gray-800/60 border-gray-700 text-gray-400'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>IA 24/7: {contact.aiAutoPilot ? 'Activa' : 'Pausada'}</span>
          </button>
        </div>

        {/* Lead Score */}
        <div className="text-right">
          <div className="text-[10px] text-gray-400 uppercase font-semibold">Lead Score</div>
          <div className="text-xs font-bold text-indigo-400">{contact.leadScore || 50}/100</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5">
        {/* Stage & Value */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">Fase del Pipeline</label>
            <select
              value={contact.pipelineStageId}
              onChange={e => handleStageChange(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {stages.map(st => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-gray-400 block mb-1">Valor Comercial</label>
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-400 font-bold">
              ${contact.opportunityValue?.toLocaleString()} USD
            </div>
          </div>
        </div>

        {/* Contact metadata */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 text-gray-300">
            <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>{contact.phone || 'No registrado'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Building className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span>{contact.company || 'Empresa particular'}</span>
          </div>
          {contact.birthDate && (
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              <span>Cumpleaños: {contact.birthDate}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 block mb-1.5">Etiquetas Activas</label>
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((tg, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-[10px] font-medium">
                {tg}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs: Notes & Tasks */}
        <div>
          <div className="flex border-b border-gray-800 mb-3">
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition ${
                activeTab === 'notes' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Notas ({contact.notes?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition ${
                activeTab === 'tasks' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Tareas ({contact.tasks?.length || 0})
            </button>
          </div>

          {activeTab === 'notes' ? (
            <div className="space-y-3">
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Añadir nota interna sobre este prospecto..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={loading || !noteText.trim()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Añadir Nota
                </button>
              </form>

              <div className="space-y-2">
                {contact.notes?.map(n => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 text-xs">
                    <p className="text-gray-200 mb-1">{n.text}</p>
                    <div className="text-[10px] text-gray-500 flex justify-between">
                      <span>{n.author}</span>
                      <span>{n.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <form onSubmit={handleAddTask} className="space-y-2">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  placeholder="Título de la tarea..."
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={e => setTaskDueDate(e.target.value)}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !taskTitle.trim()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Crear Tarea
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                {contact.tasks?.map(t => (
                  <div key={t.id} className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                      <span className={t.completed ? 'line-through text-gray-500' : 'text-gray-200'}>
                        {t.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400">{t.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
