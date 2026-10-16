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
  ArrowRight,
  Trash2,
  Zap,
  Terminal,
  X,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { InstagramIcon as Instagram } from './CustomIcons';
import { Workflow, WorkflowNode, Contact } from '../types';
import { api } from '../api';

interface WorkflowsViewProps {
  workflows: Workflow[];
  onRefresh: () => void;
}

const AVAILABLE_TRIGGERS = [
  { id: 'INCOMING_WHATSAPP', name: 'Mensaje Entrante de WhatsApp', desc: 'Se dispara cuando un prospecto escribe por WhatsApp' },
  { id: 'INCOMING_INSTAGRAM', name: 'Mensaje Directo (DM) de Instagram', desc: 'Se dispara al recibir un nuevo DM o mención en Instagram' },
  { id: 'PIPELINE_STAGE_CHANGED', name: 'Oportunidad Movida en Pipeline', desc: 'Se activa al avanzar un lead a una etapa específica del embudo' },
  { id: 'FORM_SUBMITTED', name: 'Formulario Web Completado', desc: 'Se activa al registrarse en un formulario de captación' },
  { id: 'TAG_ADDED', name: 'Etiqueta Asignada al Contacto', desc: 'Se activa al etiquetar un prospecto (ej. VIP, Cotización)' }
];

const AVAILABLE_ACTIONS = [
  { id: 'SEND_WHATSAPP', name: 'Enviar WhatsApp', icon: MessageCircle, color: 'text-emerald-400', defaultTitle: 'WhatsApp Automático', defaultDesc: 'Envía mensaje personalizado' },
  { id: 'SEND_INSTAGRAM', name: 'Enviar Instagram DM', icon: Instagram, color: 'text-pink-400', defaultTitle: 'DM de Instagram', defaultDesc: 'Responde automáticamente por DM' },
  { id: 'SEND_EMAIL', name: 'Enviar Correo Electrónico', icon: Mail, color: 'text-amber-400', defaultTitle: 'Email Transaccional', defaultDesc: 'Envía información o recordatorio' },
  { id: 'MODIFY_LEAD_SCORE', name: 'Modificar Lead Score', icon: TrendingUp, color: 'text-indigo-400', defaultTitle: 'Aumentar Puntuación (+25 pts)', defaultDesc: 'Incrementa el interés comercial' },
  { id: 'TIME_DELAY', name: 'Tiempo de Espera (Delay)', icon: Clock, color: 'text-blue-400', defaultTitle: 'Esperar 15 Minutos', defaultDesc: 'Espera antes del siguiente paso' },
  { id: 'ACTIVATE_AI', name: 'Activar Agente IA 24/7', icon: BotIcon, color: 'text-emerald-400', defaultTitle: 'Piloto Automático IA', defaultDesc: 'Activa la IA para responder autónomamente' }
];

function BotIcon(props: any) {
  return <Cpu {...props} />;
}

export const WorkflowsView: React.FC<WorkflowsViewProps> = ({ workflows, onRefresh }) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(workflows[0]?.id || '');
  const [selectedFolder, setSelectedFolder] = useState('all');

  // AI Generator Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('Crear un flujo para captar prospectos por WhatsApp, enviar catálogo, aumentar lead score en 25 puntos y activar el agente de IA 24/7');
  const [generatingAi, setGeneratingAi] = useState(false);

  // Manual Workflow Builder Modal
  const [showBuilderModal, setShowBuilderModal] = useState(false);
  const [builderName, setBuilderName] = useState('');
  const [builderFolder, setBuilderFolder] = useState('Captación de Prospectos');
  const [builderTrigger, setBuilderTrigger] = useState('INCOMING_WHATSAPP');
  const [builderSteps, setBuilderSteps] = useState<{ type: string; title: string; message?: string; increment?: number; delayMinutes?: number }[]>([
    { type: 'SEND_WHATSAPP', title: 'Enviar WhatsApp de Bienvenida', message: '¡Hola {{firstName}}! Bienvenido a MARGARITA HUB CRM. Nuestro Asistente IA te atenderá ahora mismo.' },
    { type: 'MODIFY_LEAD_SCORE', title: 'Sumar Puntuación de Interés', increment: 25 },
    { type: 'ACTIVATE_AI', title: 'Activar Piloto Automático IA 24/7' }
  ]);

  // Live Test Execution Modal & Logs
  const [showTestModal, setShowTestModal] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<{ time: string; nodeTitle: string; status: 'success' | 'failed'; detail: string }[]>([]);

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
        triggerType: generated.triggerType || 'INCOMING_WHATSAPP',
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

  const handleCreateManualWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderName.trim()) return;

    const triggerInfo = AVAILABLE_TRIGGERS.find(t => t.id === builderTrigger);

    // Build sequential nodes
    const nodes: WorkflowNode[] = [
      {
        id: `n-trigger-${Date.now()}`,
        type: 'TRIGGER',
        title: `Disparador: ${triggerInfo?.name || 'Evento'}`,
        description: triggerInfo?.desc || 'Evento desencadenante',
        config: { triggerType: builderTrigger },
        next: builderSteps.length > 0 ? `n-step-0` : undefined
      }
    ];

    builderSteps.forEach((step, idx) => {
      const nextId = idx < builderSteps.length - 1 ? `n-step-${idx + 1}` : undefined;
      nodes.push({
        id: `n-step-${idx}`,
        type: step.type,
        title: step.title,
        description: `Paso de acción configurado`,
        config: {
          message: step.message,
          increment: step.increment,
          delayMinutes: step.delayMinutes
        },
        next: nextId
      });
    });

    try {
      const newWf = await api.createWorkflow({
        name: builderName.trim(),
        folder: builderFolder,
        status: 'active',
        triggerType: builderTrigger,
        nodes
      });
      setShowBuilderModal(false);
      setBuilderName('');
      onRefresh();
      setSelectedWorkflowId(newWf.id);
    } catch (err: any) {
      alert(err.message || 'Error al guardar automatización');
    }
  };

  const handleDeleteWorkflow = async (id: string, name: string) => {
    if (confirm(`¿Eliminar la automatización "${name}"?`)) {
      try {
        await api.deleteWorkflow(id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error al eliminar');
      }
    }
  };

  const handleExecuteLiveTest = async () => {
    if (!activeWorkflow) return;
    setExecuting(true);
    setExecutionLogs([]);
    setShowTestModal(true);

    try {
      const res = await api.executeWorkflowLive(activeWorkflow.id);
      setExecutionLogs(res.logs);
      onRefresh();
    } catch (err: any) {
      setExecutionLogs([
        {
          time: new Date().toLocaleTimeString(),
          nodeTitle: 'Error de Ejecución',
          status: 'failed',
          detail: err.message || 'Fallo al ejecutar el flujo'
        }
      ]);
    } finally {
      setExecuting(false);
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Automatizaciones y Flujos de Trabajo (Workflows)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20">
              Motor Sin Código
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Conecta disparadores multicanal, condiciones lógicas, esperas programadas y respuestas autónomas 24/7.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Button: Crear Automatización Manual */}
          <button
            onClick={() => setShowBuilderModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Crear Flujo</span>
          </button>

          {/* Button: Construir vía AI */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition"
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
                    : 'bg-gray-900/60 border-gray-800/80 hover:bg-gray-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-xs text-white leading-tight">
                    {wf.name}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      wf.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {wf.status === 'active' ? 'Activo' : 'Borrador'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-800/60">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Folder className="w-3 h-3 text-indigo-400" />
                    {wf.folder}
                  </span>
                  <span className="font-mono text-gray-300">
                    {wf.executionsCount || 0} ejecuciones
                  </span>
                </div>
              </div>
            );
          })}

          {filteredWorkflows.length === 0 && (
            <div className="p-8 text-center text-gray-500 text-xs border border-dashed border-gray-800 rounded-xl">
              No hay automatizaciones en esta carpeta.
            </div>
          )}
        </div>

        {/* Right: Visual Flow Diagram & Live Execution Console */}
        <div className="lg:col-span-8 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[500px]">
          {activeWorkflow ? (
            <div className="space-y-6">
              {/* Header of Active Workflow */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{activeWorkflow.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      {activeWorkflow.status === 'active' ? 'En Ejecución 24/7' : 'Pausado'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Disparador principal: <span className="text-indigo-400 font-semibold">{activeWorkflow.triggerType}</span> | Última actualización: {activeWorkflow.updatedAt}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Button: Probar Flujo en Vivo */}
                  <button
                    onClick={handleExecuteLiveTest}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition"
                    title="Ejecutar este flujo con un prospecto real o de prueba"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Probar Flujo en Vivo</span>
                  </button>

                  {/* Button: Delete Workflow */}
                  {workflows.length > 1 && (
                    <button
                      onClick={() => handleDeleteWorkflow(activeWorkflow.id, activeWorkflow.name)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                      title="Eliminar este flujo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Visual Node Diagram */}
              <div className="flex flex-col items-center space-y-3 py-4 max-w-xl mx-auto">
                {activeWorkflow.nodes?.map((node, index) => {
                  const isTrigger = node.type === 'TRIGGER';
                  return (
                    <React.Fragment key={node.id}>
                      <div className="w-full">
                        <div
                          className={`p-4 rounded-xl border transition shadow-sm ${
                            isTrigger
                              ? 'bg-gradient-to-r from-emerald-950/30 to-gray-900 border-emerald-500/50 ring-1 ring-emerald-500/20'
                              : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-gray-800/80 border border-gray-700/50 shrink-0">
                              {getNodeIcon(node.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-white truncate">
                                  {node.title}
                                </h4>
                                <span className="text-[10px] font-mono text-gray-500">
                                  Paso {index + 1}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {node.description}
                              </p>
                              {node.config?.message && (
                                <div className="mt-2 p-2 rounded-lg bg-gray-950 border border-gray-800 text-[11px] font-mono text-gray-300">
                                  "{node.config.message}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {index < activeWorkflow.nodes.length - 1 && (
                        <div className="flex items-center justify-center text-gray-600">
                          <ArrowDown className="w-4 h-4 animate-bounce" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-gray-500 text-xs">
              Selecciona una automatización para inspeccionar su diagrama.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Constructor Manual de Flujos */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <WorkflowIcon className="w-5 h-5 text-indigo-400" />
                Diseñador de Flujos de Automatización
              </h3>
              <button onClick={() => setShowBuilderModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualWorkflow} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Nombre del Flujo</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Captación WhatsApp + Cita High-Ticket"
                    value={builderName}
                    onChange={(e) => setBuilderName(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Carpeta de Organización</label>
                  <select
                    value={builderFolder}
                    onChange={(e) => setBuilderFolder(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Captación de Prospectos">Captación de Prospectos</option>
                    <option value="Atención al Cliente">Atención al Cliente</option>
                    <option value="Ventas y Cierres">Ventas y Cierres</option>
                    <option value="Fidelización">Fidelización</option>
                  </select>
                </div>
              </div>

              {/* Trigger Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">1. Disparador Inicial (Trigger)</label>
                <select
                  value={builderTrigger}
                  onChange={(e) => setBuilderTrigger(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {AVAILABLE_TRIGGERS.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Steps */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-gray-300">2. Pasos de Acción Consecutivos ({builderSteps.length})</label>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {builderSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-400">Paso {idx + 1}: {step.title}</span>
                          <button
                            type="button"
                            onClick={() => setBuilderSteps(prev => prev.filter((_, i) => i !== idx))}
                            className="text-gray-500 hover:text-red-400 text-xs"
                          >
                            Eliminar
                          </button>
                        </div>

                        {step.type === 'SEND_WHATSAPP' && (
                          <input
                            type="text"
                            placeholder="Mensaje de WhatsApp (admite {{firstName}}, {{company}})"
                            value={step.message || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setBuilderSteps(prev => prev.map((s, i) => i === idx ? { ...s, message: val } : s));
                            }}
                            className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-gray-200"
                          />
                        )}

                        {step.type === 'MODIFY_LEAD_SCORE' && (
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>Sumar puntos de Score:</span>
                            <input
                              type="number"
                              value={step.increment || 25}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setBuilderSteps(prev => prev.map((s, i) => i === idx ? { ...s, increment: val } : s));
                              }}
                              className="w-20 bg-gray-900 border border-gray-800 rounded-lg px-2 py-1 text-xs text-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-800">
                  {AVAILABLE_ACTIONS.map(action => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => setBuilderSteps(prev => [
                        ...prev,
                        {
                          type: action.id,
                          title: action.defaultTitle,
                          message: action.id === 'SEND_WHATSAPP' ? 'Hola {{firstName}}, un gusto saludarte.' : undefined,
                          increment: action.id === 'MODIFY_LEAD_SCORE' ? 20 : undefined,
                          delayMinutes: action.id === 'TIME_DELAY' ? 15 : undefined
                        }
                      ])}
                      className="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold border border-gray-700 flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3 text-indigo-400" />
                      <span>{action.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Guardar y Activar Flujo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Ejecución y Logs en Vivo */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Consola de Ejecución en Vivo: "{activeWorkflow?.name}"
                </h3>
              </div>
              <button onClick={() => setShowTestModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Terminal Body */}
            <div className="bg-black/90 border border-gray-800/80 rounded-xl p-4 font-mono text-xs text-gray-300 max-h-80 overflow-y-auto space-y-2.5">
              {executing && (
                <div className="flex items-center gap-2 text-indigo-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                  <span>Ejecutando pasos del flujo en tiempo real...</span>
                </div>
              )}

              {executionLogs.map((log, idx) => (
                <div key={idx} className="space-y-0.5 border-b border-gray-900 pb-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">[{log.time}]</span>
                    <span className={log.status === 'success' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                      {log.status === 'success' ? '✓ COMPLETADO' : '✗ ERROR'}
                    </span>
                  </div>
                  <div className="text-white font-semibold">{log.nodeTitle}</div>
                  <div className="text-gray-400 text-[11px]">{log.detail}</div>
                </div>
              ))}

              {!executing && executionLogs.length > 0 && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
                  ✅ ¡Automatización ejecutada con éxito! Los cambios de lead score, notas y mensajes se han aplicado al contacto.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold"
              >
                Cerrar Consola
              </button>
              <button
                onClick={handleExecuteLiveTest}
                disabled={executing}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Re-ejecutar Prueba</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Construir vía AI */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Generador de Automatizaciones con IA
              </h3>
              <button onClick={() => setShowAiModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateViaAi} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Describe en lenguaje natural qué deseas automatizar:
                </label>
                <textarea
                  rows={4}
                  required
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={generatingAi}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 flex items-center gap-2 shadow-md shadow-purple-600/30"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generatingAi ? 'Diseñando flujo...' : 'Construir Automatización'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
