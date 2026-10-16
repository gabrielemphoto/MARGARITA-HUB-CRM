import React, { useState } from 'react';
import {
  Workflow as WorkflowIcon,
  Plus,
  Sparkles,
  Play,
  Clock,
  Split,
  MessageCircle,
  Mail,
  UserCheck,
  TrendingUp,
  Folder,
  ArrowDown,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { InstagramIcon as Instagram } from './CustomIcons';
import { Workflow, WorkflowNode } from '../types';
import { api } from '../api';

interface WorkflowsViewProps {
  workflows: Workflow[];
  onRefresh: () => void;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ workflows, onRefresh }) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || '');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Crear un flujo para captar prospectos de bienes raíces por WhatsApp, enviar catálogo digital, aumentar lead score en 20 puntos, esperar 15 minutos y si no agendó cita enviar recordatorio por email');
  const [generatingAi, setGeneratingAi] = useState(false);

  const activeWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  const folders = ['all', 'Captación de Prospectos', 'Atención al Cliente', 'Generados vía AI'];

  const filteredWorkflows = workflows.filter(
    w => selectedFolder === 'all' || w.folder === selectedFolder
  );

  const handleGenerateViaAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setGeneratingAi(true);

    try {
      const generated = await api.generateWorkflowAI(aiPrompt);
      const newWf = await api.createWorkflow({
        name: generated.name || 'Flujo Creado con IA',
        folder: 'Generados vía AI',
        status: 'active',
        triggerType: generated.triggerType || 'INCOMING_MESSAGE',
        nodes: generated.nodes || []
      });
      setShowAiModal(false);
      onRefresh();
      setSelectedWorkflowId(newWf.id);
    } catch (err) {
      console.error(err);
      alert('Error al generar flujo con IA');
    } finally {
      setGeneratingAi(false);
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'TRIGGER':
        return <Play className="w-4 h-4 text-emerald-400" />;
      case 'SEND_WHATSAPP':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'SEND_EMAIL':
        return <Mail className="w-4 h-4 text-amber-400" />;
      case 'SEND_INSTAGRAM':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'IF_ELSE':
        return <Split className="w-4 h-4 text-purple-400" />;
      case 'TIME_DELAY':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'MODIFY_LEAD_SCORE':
        return <TrendingUp className="w-4 h-4 text-indigo-400" />;
      case 'ASSIGN_USER':
        return <UserCheck className="w-4 h-4 text-cyan-400" />;
      default:
        return <Cpu className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Automatizaciones y Flujos de Trabajo (Workflows)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
              Motor Sin Código
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Conecta disparadores, condiciones lógicas, esperas programadas y acciones de mensajería multicanal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Construir vía AI Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-purple-600/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Construir vía AI</span>
          </button>
        </div>
      </div>

      {/* Folder Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2 overflow-x-auto">
        {folders.map(f => (
          <button
            key={f}
            onClick={() => setSelectedFolder(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedFolder === f
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>{f === 'all' ? 'Todas las Carpetas' : f}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Workflows List & Visual Flow Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Workflows list in folder */}
        <div className="lg:col-span-4 space-y-3">
          {filteredWorkflows.map(wf => {
            const isSelected = activeWorkflow?.id === wf.id;
            return (
              <div
                key={wf.id}
                onClick={() => setSelectedWorkflowId(wf.id)}
                className={`p-4 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-950/40 to-transparent border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                    : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {wf.folder}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      wf.status === 'active'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-gray-800 text-gray-500'
                    }`}
                  >
                    {wf.status === 'active' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-white mb-2">{wf.name}</h3>

                <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                  <span>{wf.nodes?.length || 0} pasos configurados</span>
                  <span className="text-indigo-400 font-bold">{wf.executionsCount || 0} ejecuciones</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Visual Node Diagram */}
        <div className="lg:col-span-8 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          {activeWorkflow ? (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                      Carpeta: {activeWorkflow.folder}
                    </span>
                    <span>•</span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      {activeWorkflow.executionsCount} activaciones automáticas
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white">{activeWorkflow.name}</h2>
                </div>

                <button className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 font-semibold">
                  Añadir Paso (+)
                </button>
              </div>

              {/* Node Sequence List */}
              <div className="flex flex-col items-center space-y-3 max-w-xl mx-auto py-2">
                {activeWorkflow.nodes?.map((node, nIdx) => (
                  <React.Fragment key={node.id}>
                    {/* Node Card */}
                    <div className="w-full bg-gray-950 border border-gray-800/90 hover:border-indigo-500/50 rounded-xl p-4 shadow-lg transition-all group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center shrink-0">
                            {getNodeIcon(node.type)}
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-gray-500 uppercase block font-semibold">
                              {node.type.replace(/_/g, ' ')}
                            </span>
                            <h4 className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                              {node.title}
                            </h4>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-gray-400">
                          Paso {nIdx + 1}
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-2.5 leading-relaxed pl-12">
                        {node.description}
                      </p>

                      {node.type === 'IF_ELSE' && (
                        <div className="mt-3 pl-12 grid grid-cols-2 gap-2 text-[11px] font-semibold">
                          <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-400">
                            ✓ Rama Sí (Cita Agendada): Notificar al equipo comercial
                          </div>
                          <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-400">
                            ✕ Rama No: Enviar recordatorio por email
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Connecting Arrow */}
                    {nIdx < activeWorkflow.nodes.length - 1 && (
                      <div className="flex flex-col items-center text-gray-600 my-0.5">
                        <div className="w-0.5 h-3 bg-gray-800"></div>
                        <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-gray-500">
              No hay flujos creados en esta carpeta.
            </div>
          )}
        </div>
      </div>

      {/* "Construir vía AI" Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Construir Automatización vía IA</h3>
                  <p className="text-xs text-gray-400">Describe tu objetivo en lenguaje natural</p>
                </div>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGenerateViaAi} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">
                  ¿Qué proceso de ventas o marketing deseas automatizar?
                </label>
                <textarea
                  rows={4}
                  required
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="Ej: Si un cliente reserva una cita en el calendario, enviar confirmación por WhatsApp, esperar 1 hora antes de la reunión para enviar link de Zoom y sumar 30 puntos al score."
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-purple-300 text-[11px] leading-relaxed">
                La Inteligencia Artificial creará automáticamente los disparadores (Triggers), los mensajes personalizados con variables ({"{{firstName}}"}), las divisiones lógicas (If/Else) y los retrasos de tiempo.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={generatingAi}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generatingAi ? 'Diseñando flujo con IA...' : 'Generar Flujo Completo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
