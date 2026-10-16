import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  DollarSign,
  Plus,
  ArrowRight,
  ArrowLeft,
  Bot,
  User,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
  Trash2,
  Edit2,
  FolderPlus,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';
import { Contact, PipelineStage, Pipeline } from '../types';
import { api } from '../api';

interface PipelinesViewProps {
  stages: PipelineStage[];
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onOpenNewLead: () => void;
  onRefresh: () => void;
}

const PRESET_COLORS = [
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Púrpura', hex: '#8b5cf6' },
  { name: 'Ámbar', hex: '#f59e0b' },
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Cian', hex: '#06b6d4' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Rojo', hex: '#ef4444' }
];

export const PipelinesView: React.FC<PipelinesViewProps> = ({
  stages,
  contacts,
  onSelectContact,
  onOpenNewLead,
  onRefresh
}) => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [activePipelineId, setActivePipelineId] = useState<string>('');
  const [movingId, setMovingId] = useState<string | null>(null);

  // Modals
  const [isNewPipelineOpen, setIsNewPipelineOpen] = useState(false);
  const [newPipeName, setNewPipeName] = useState('');
  const [newPipeDesc, setNewPipeDesc] = useState('');

  const [isNewStageOpen, setIsNewStageOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('#6366f1');

  const loadPipelines = async () => {
    try {
      const res = await api.getPipelines();
      if (res.pipelines) {
        setPipelines(res.pipelines);
        setActivePipelineId(res.activePipelineId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPipelines();
  }, [stages, contacts]);

  const currentPipeline = pipelines.find(p => p.id === activePipelineId) || pipelines[0];
  const activeStages = currentPipeline?.stages || stages;

  const handleSwitchPipeline = async (pipeId: string) => {
    setActivePipelineId(pipeId);
    await api.setActivePipeline(pipeId);
    onRefresh();
  };

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPipeName.trim()) return;
    try {
      const created = await api.createPipeline(newPipeName, newPipeDesc);
      setIsNewPipelineOpen(false);
      setNewPipeName('');
      setNewPipeDesc('');
      await loadPipelines();
      setActivePipelineId(created.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error al crear pipeline');
    }
  };

  const handleDeletePipeline = async () => {
    if (!currentPipeline) return;
    if (confirm(`¿Estás seguro de eliminar el pipeline "${currentPipeline.name}"?`)) {
      try {
        await api.deletePipeline(currentPipeline.id);
        await loadPipelines();
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar pipeline');
      }
    }
  };

  const handleAddStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageName.trim() || !currentPipeline) return;
    try {
      await api.addStageToPipeline(currentPipeline.id, newStageName, newStageColor);
      setIsNewStageOpen(false);
      setNewStageName('');
      await loadPipelines();
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error al agregar etapa');
    }
  };

  const handleDeleteStage = async (stageId: string, stageName: string) => {
    if (!currentPipeline) return;
    if (confirm(`¿Eliminar la etapa "${stageName}"? Los contactos en esta fase no se borrarán.`)) {
      try {
        await api.deleteStageFromPipeline(currentPipeline.id, stageId);
        await loadPipelines();
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar etapa');
      }
    }
  };

  const handleQuickMove = async (contactId: string, currentStageId: string, direction: 'next' | 'prev') => {
    const currentIndex = activeStages.findIndex(s => s.id === currentStageId);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= activeStages.length) return;

    const targetStage = activeStages[nextIndex];
    setMovingId(contactId);

    try {
      await api.moveContactStage(contactId, targetStage.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setMovingId(null);
    }
  };

  const totalPipelineValue = contacts
    .filter(c => activeStages.some(s => s.id === c.pipelineStageId))
    .reduce((sum, c) => sum + (c.opportunityValue || 0), 0);

  return (
    <div className="space-y-5">
      {/* Top Bar: Pipeline Selector, Total Value, and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pipeline:</span>
          </div>

          {/* Pipeline Dropdown */}
          <select
            value={activePipelineId}
            onChange={(e) => handleSwitchPipeline(e.target.value)}
            className="bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
          >
            {pipelines.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.stages?.length || 0} etapas)
              </option>
            ))}
          </select>

          {/* Pipeline stats badge */}
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            ${totalPipelineValue.toLocaleString()} USD
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button: Add Stage */}
          <button
            onClick={() => setIsNewStageOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition"
            title="Añadir nueva etapa a este pipeline"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>+ Nueva Etapa</span>
          </button>

          {/* Button: New Pipeline */}
          <button
            onClick={() => setIsNewPipelineOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition"
            title="Crear un nuevo pipeline"
          >
            <FolderPlus className="w-3.5 h-3.5 text-purple-400" />
            <span>+ Nuevo Pipeline</span>
          </button>

          {/* Button: Delete current pipeline if more than 1 */}
          {pipelines.length > 1 && (
            <button
              onClick={handleDeletePipeline}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
              title="Eliminar este pipeline"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Button: New Deal / Lead */}
          <button
            onClick={onOpenNewLead}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Oportunidad</span>
          </button>
        </div>
      </div>

      {/* Description */}
      {currentPipeline?.description && (
        <p className="text-xs text-gray-400 px-1 -mt-2">
          {currentPipeline.description}
        </p>
      )}

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
        {activeStages.map((stage, sIdx) => {
          const stageContacts = contacts.filter(c => c.pipelineStageId === stage.id);
          const stageValue = stageContacts.reduce((sum, c) => sum + (c.opportunityValue || 0), 0);

          return (
            <div
              key={stage.id}
              className="bg-gray-950/80 border border-gray-800/90 rounded-2xl p-3 min-w-[250px] flex flex-col max-h-[calc(100vh-14rem)] shadow-lg"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: stage.color }}
                  ></span>
                  <span className="font-bold text-xs text-white truncate" title={stage.name}>
                    {stage.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-gray-300">
                    {stageContacts.length}
                  </span>
                  {activeStages.length > 1 && (
                    <button
                      onClick={() => handleDeleteStage(stage.id, stage.name)}
                      className="p-1 text-gray-500 hover:text-red-400 rounded transition"
                      title="Eliminar etapa"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Column Financial Value */}
              <div className="text-[11px] font-bold text-emerald-400 mb-2 px-1 flex items-center justify-between">
                <span>${stageValue.toLocaleString()} USD</span>
                <span className="text-[10px] text-gray-500 font-normal">Etapa {sIdx + 1}/{activeStages.length}</span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                {stageContacts.length === 0 ? (
                  <div className="py-8 text-center text-gray-600 text-[11px] border border-dashed border-gray-800/80 rounded-xl">
                    Sin prospectos en esta etapa
                  </div>
                ) : (
                  stageContacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => onSelectContact(contact)}
                      className={`bg-gray-900/90 hover:bg-gray-900 border border-gray-800 hover:border-indigo-500/60 rounded-xl p-3 cursor-pointer transition shadow-sm group ${
                        movingId === contact.id ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <h4 className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors truncate">
                          {contact.firstName} {contact.lastName}
                        </h4>
                        <span className="text-xs font-bold text-emerald-400 shrink-0">
                          ${contact.opportunityValue?.toLocaleString()}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 truncate mb-2">
                        {contact.company || 'Cliente Particular'}
                      </p>

                      {/* Lead Score & AI Autopilot Badge */}
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-800/60">
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-indigo-400 font-semibold">Score:</span>
                          <span>{contact.leadScore || 50}</span>
                        </div>

                        {contact.aiAutoPilot && (
                          <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold" title="Atendido por IA 24/7">
                            <Bot className="w-3 h-3" /> IA 24/7
                          </span>
                        )}
                      </div>

                      {/* Quick Move Arrows */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-800/40" onClick={e => e.stopPropagation()}>
                        <button
                          disabled={sIdx === 0}
                          onClick={() => handleQuickMove(contact.id, stage.id, 'prev')}
                          className="p-1 rounded hover:bg-gray-800 disabled:opacity-20 text-gray-400 hover:text-white transition"
                          title="Retroceder etapa"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <span className="text-[9px] text-gray-500">Mover</span>
                        <button
                          disabled={sIdx === activeStages.length - 1}
                          onClick={() => handleQuickMove(contact.id, stage.id, 'next')}
                          className="p-1 rounded hover:bg-gray-800 disabled:opacity-20 text-gray-400 hover:text-white transition"
                          title="Avanzar etapa"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Crear Nuevo Pipeline */}
      {isNewPipelineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                Crear Nuevo Pipeline
              </h3>
              <button onClick={() => setIsNewPipelineOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePipeline} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre del Pipeline</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Ventas Inmobiliarias o Servicios High-Ticket"
                  value={newPipeName}
                  onChange={(e) => setNewPipeName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Descripción / Objetivo</label>
                <textarea
                  rows={2}
                  placeholder="ej. Seguimiento de prospectos calificados para cierre de servicios"
                  value={newPipeDesc}
                  onChange={(e) => setNewPipeDesc(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] leading-relaxed">
                ℹ️ Al crearlo, se inicializará con 4 etapas base que podrás personalizar, renombrar o ampliar a tu gusto.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPipelineOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Guardar Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Añadir Nueva Etapa */}
      {isNewStageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                Nueva Etapa en "{currentPipeline?.name}"
              </h3>
              <button onClick={() => setIsNewStageOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStage} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre de la Etapa</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Esperando Contrato o Demo Agendada"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">Color Distintivo</label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewStageColor(c.hex)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border text-[11px] font-semibold transition ${
                        newStageColor === c.hex ? 'border-white bg-gray-800' : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.hex }}></span>
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewStageOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Añadir Etapa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
