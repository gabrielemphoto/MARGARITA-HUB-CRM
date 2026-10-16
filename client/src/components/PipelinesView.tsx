import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Contact, PipelineStage } from '../types';
import { api } from '../api';

interface PipelinesViewProps {
  stages: PipelineStage[];
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onOpenNewLead: () => void;
  onRefresh: () => void;
}

export const PipelinesView: React.FC<PipelinesViewProps> = ({
  stages,
  contacts,
  onSelectContact,
  onOpenNewLead,
  onRefresh
}) => {
  const [movingId, setMovingId] = useState<string | null>(null);

  const handleQuickMove = async (contactId: string, currentStageId: string, direction: 'next' | 'prev') => {
    const currentIndex = stages.findIndex(s => s.id === currentStageId);
    if (currentIndex === -1) return;

    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex < 0 || nextIndex >= stages.length) return;

    const targetStage = stages[nextIndex];
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

  const totalPipelineValue = contacts.reduce((sum, c) => sum + (c.opportunityValue || 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Pipeline Visual de Oportunidades Comerciales
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              ${totalPipelineValue.toLocaleString()} USD
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Gestiona el ciclo de ventas, mueve prospectos de etapa y monitorea el avance comercial.
          </p>
        </div>

        <button
          onClick={onOpenNewLead}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Oportunidad</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-4">
        {stages.map((stage, sIdx) => {
          const stageContacts = contacts.filter(c => c.pipelineStageId === stage.id);
          const stageValue = stageContacts.reduce((sum, c) => sum + (c.opportunityValue || 0), 0);

          return (
            <div
              key={stage.id}
              className="bg-gray-950/70 border border-gray-800/90 rounded-xl p-3 min-w-[240px] flex flex-col max-h-[calc(100vh-14rem)] shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  ></span>
                  <span className="font-bold text-xs text-white truncate">{stage.name}</span>
                </div>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-gray-400">
                  {stageContacts.length}
                </span>
              </div>

              {/* Column Value Subtitle */}
              <div className="text-[11px] font-bold text-emerald-400/90 mb-3 px-1">
                ${stageValue.toLocaleString()} USD
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                {stageContacts.length === 0 ? (
                  <div className="py-8 text-center text-gray-600 text-[11px] border border-dashed border-gray-800 rounded-lg">
                    Sin oportunidades
                  </div>
                ) : (
                  stageContacts.map(contact => (
                    <div
                      key={contact.id}
                      onClick={() => onSelectContact(contact)}
                      className={`bg-gray-900/90 hover:bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl p-3 cursor-pointer transition shadow-sm group ${
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
                        {contact.company || 'Particular'}
                      </p>

                      {/* Tags & Score */}
                      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2 border-t border-gray-800/60">
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-indigo-400 font-semibold">Score:</span>
                          <span>{contact.leadScore || 50}</span>
                        </div>

                        {contact.aiAutoPilot && (
                          <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold" title="Atendido por IA 24/7">
                            <Bot className="w-3 h-3" /> IA
                          </span>
                        )}
                      </div>

                      {/* Stage mover buttons */}
                      <div
                        className="mt-2.5 pt-1.5 border-t border-gray-800/40 flex items-center justify-between"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          disabled={sIdx === 0}
                          onClick={() => handleQuickMove(contact.id, stage.id, 'prev')}
                          className="p-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-20 text-gray-400 hover:text-white transition"
                          title="Mover a etapa anterior"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>

                        <span className="text-[9px] text-gray-500">Mover fase</span>

                        <button
                          disabled={sIdx === stages.length - 1}
                          onClick={() => handleQuickMove(contact.id, stage.id, 'next')}
                          className="p-1 rounded bg-gray-800 hover:bg-gray-700 disabled:opacity-20 text-gray-400 hover:text-white transition"
                          title="Mover a siguiente etapa"
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
    </div>
  );
};
