import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Cpu,
  Key,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Play,
  Send,
  MessageCircle,
  Mail,
  UserCheck,
  Server,
  Zap,
  Save
} from 'lucide-react';
import { InstagramIcon as Instagram, FacebookIcon as Facebook } from './CustomIcons';
import { AISettings } from '../types';
import { api } from '../api';

interface AIAgentsViewProps {
  aiSettings: AISettings;
  onRefresh: () => void;
}

export const AIAgentsView: React.FC<AIAgentsViewProps> = ({ aiSettings, onRefresh }) => {
  const [formSettings, setFormSettings] = useState<AISettings>({ ...aiSettings });
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Playground test state
  const [testPrompt, setTestPrompt] = useState('Hola, ¿qué servicios ofrecen y cuál es el precio del plan Pro con WhatsApp?');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ai'; text: string; provider?: string }[]>([
    {
      sender: 'ai',
      text: '¡Hola! Soy el Agente de IA 24/7 de MARGARITA HUB CRM. Estoy configurado para atender consultas, cotizar servicios y agendar citas automáticamente. ¿Qué te gustaría consultar?',
      provider: 'Margarita Autonomous Engine'
    }
  ]);
  const [testingAi, setTestingAi] = useState(false);

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI (GPT-4o)',
      models: ['gpt-4o-mini', 'gpt-4o', 'o1-mini', 'gpt-3.5-turbo'],
      defaultModel: 'gpt-4o-mini',
      desc: 'Modelos de lenguaje insignia de OpenAI, ideales para razonamiento complejo y ventas.'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
      defaultModel: 'gemini-1.5-flash',
      desc: 'Excelente velocidad y comprensión multimodal de Google DeepMind.'
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
      defaultModel: 'claude-3-5-sonnet-20241022',
      desc: 'Máxima calidez humana, empatía y redacción de respuestas comerciales persuasivas.'
    },
    {
      id: 'groq',
      name: 'Groq (Ultra-Fast Llama 3.3)',
      models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
      defaultModel: 'llama-3.3-70b-versatile',
      desc: 'Inferencia ultra rápida con latencia en milisegundos para respuestas instantáneas.'
    },
    {
      id: 'custom',
      name: 'Servidor Propio / Local (Ollama, LM Studio, DeepSeek)',
      models: ['deepseek-chat', 'llama3', 'mistral', 'qwen2.5:7b', 'custom-model'],
      defaultModel: 'deepseek-chat',
      desc: 'Conéctate a cualquier API compatible con OpenAI en tu red local o nube privada.'
    }
  ];

  const handleProviderChange = (providerId: any) => {
    const prov = providers.find(p => p.id === providerId);
    setFormSettings(prev => ({
      ...prev,
      provider: providerId,
      model: prov?.defaultModel || prev.model,
      baseUrl: providerId === 'custom' ? (prev.baseUrl || 'http://localhost:11434/v1') : prev.baseUrl
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await api.updateAISettings(formSettings);
      setSavedSuccess(true);
      onRefresh();
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar configuración de IA');
    } finally {
      setSaving(false);
    }
  };

  const handleTestChat = async () => {
    if (!testPrompt.trim() || testingAi) return;
    const userMsg = testPrompt;
    setTestPrompt('');
    setChatLog(prev => [...prev, { sender: 'user', text: userMsg }]);
    setTestingAi(true);

    try {
      const res = await api.testAI(userMsg);
      setChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          provider: res.providerUsed
        }
      ]);
    } catch (err) {
      console.error(err);
      setChatLog(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Error al contactar con el modelo de IA. Verifica tu API Key o conexión.',
          provider: 'Error'
        }
      ]);
    } finally {
      setTestingAi(false);
    }
  };

  const currentProviderInfo = providers.find(p => p.id === formSettings.provider);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Configuración del Motor de Inteligencia Artificial (24/7)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Multi-LLM Compatible
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Conecta OpenAI, Google Gemini, Anthropic Claude, Groq o servidores locales (Ollama/LM Studio).
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Guardando...' : 'Guardar Configuración IA'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>¡Configuración de IA guardada y sincronizada para todas las conversaciones 24/7!</span>
        </div>
      )}

      {/* Main Grid: Settings & Live Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Left Column */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-5">
          {/* 1. Provider Selector */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              1. Selecciona el Proveedor de Inteligencia Artificial
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {providers.map(p => {
                const isSelected = formSettings.provider === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleProviderChange(p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-950/60 to-purple-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white">{p.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-tight">{p.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Provider credentials */}
            <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Modelo Específico</label>
                  <select
                    value={formSettings.model}
                    onChange={e => setFormSettings({ ...formSettings, model: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {currentProviderInfo?.models.map((m, i) => (
                      <option key={i} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    API Key ({formSettings.provider.toUpperCase()})
                  </label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={formSettings.apiKey}
                      onChange={e => setFormSettings({ ...formSettings, apiKey: e.target.value })}
                      placeholder="sk-... o tu clave de API"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-3 pr-8 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-2 text-gray-500 hover:text-white text-[11px]"
                    >
                      {showKey ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 block">
                    (Si la dejas vacía, el sistema usa el motor inteligente offline de respaldo).
                  </span>
                </div>
              </div>

              {formSettings.provider === 'custom' && (
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    URL Base del Servidor (Endpoint Compatible con OpenAI)
                  </label>
                  <input
                    type="text"
                    value={formSettings.baseUrl}
                    onChange={e => setFormSettings({ ...formSettings, baseUrl: e.target.value })}
                    placeholder="http://localhost:11434/v1"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-xs text-white font-mono"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    Compatible con Ollama (`http://localhost:11434/v1`), LM Studio (`http://localhost:1234/v1`) o vLLM.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 2. System Prompt & Persona */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              2. Instrucciones y Personalidad del Asistente (System Prompt)
            </h2>

            <div>
              <textarea
                rows={5}
                value={formSettings.systemPrompt}
                onChange={e => setFormSettings({ ...formSettings, systemPrompt: e.target.value })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Temperature & Max tokens */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Creatividad (Temperatura):</span>
                  <span className="font-mono text-white font-bold">{formSettings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={formSettings.temperature}
                  onChange={e => setFormSettings({ ...formSettings, temperature: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Longitud Máxima de Respuesta:</span>
                  <span className="font-mono text-white font-bold">{formSettings.maxTokens} tokens</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="1500"
                  step="50"
                  value={formSettings.maxTokens}
                  onChange={e => setFormSettings({ ...formSettings, maxTokens: parseInt(e.target.value) })}
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Business Context & Knowledge Base */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              3. Base de Conocimiento del Negocio (Inyectada al Agente)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Nombre de la Empresa</label>
                <input
                  type="text"
                  value={formSettings.businessInfo.companyName}
                  onChange={e => setFormSettings({
                    ...formSettings,
                    businessInfo: { ...formSettings.businessInfo, companyName: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Enlace Oficial de Agendamiento</label>
                <input
                  type="text"
                  value={formSettings.businessInfo.bookingUrl}
                  onChange={e => setFormSettings({
                    ...formSettings,
                    businessInfo: { ...formSettings.businessInfo, bookingUrl: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-indigo-400 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-300 block mb-1 font-semibold">Servicios Ofrecidos</label>
                <input
                  type="text"
                  value={formSettings.businessInfo.services}
                  onChange={e => setFormSettings({
                    ...formSettings,
                    businessInfo: { ...formSettings.businessInfo, services: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-gray-300 block mb-1 font-semibold">Precios y Planes Comerciales</label>
                <input
                  type="text"
                  value={formSettings.businessInfo.pricing}
                  onChange={e => setFormSettings({
                    ...formSettings,
                    businessInfo: { ...formSettings.businessInfo, pricing: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            {/* Channels & Handover */}
            <div className="pt-3 border-t border-gray-800/80 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">
                  Canales Autorizados para Respuesta 24/7 Autopilot:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp Cloud' },
                    { id: 'instagram', label: 'Instagram DM' },
                    { id: 'facebook', label: 'Facebook Messenger' },
                    { id: 'email', label: 'Email' },
                    { id: 'webchat', label: 'Chat Web' }
                  ].map(ch => {
                    const checked = formSettings.autoReplyChannels.includes(ch.id as any);
                    return (
                      <label
                        key={ch.id}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer flex items-center gap-2 transition ${
                          checked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-gray-950 border-gray-800 text-gray-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={() => {
                            const current = formSettings.autoReplyChannels;
                            const next = checked
                              ? current.filter(c => c !== ch.id)
                              : [...current, ch.id as any];
                            setFormSettings({ ...formSettings, autoReplyChannels: next });
                          }}
                        />
                        <span>{ch.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Live Playground Simulator Column */}
        <div className="lg:col-span-5 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between h-[800px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <h3 className="font-bold text-sm text-white">Playground del Agente IA 24/7</h3>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                Modelo: {formSettings.model}
              </span>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Pon a prueba a tu asistente con cualquier pregunta real de clientes para evaluar sus respuestas antes de responder en producción.
            </p>

            {/* Chat conversation area */}
            <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
              {chatLog.map((item, i) => {
                const isAI = item.sender === 'ai';
                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                      {isAI && <Bot className="w-3 h-3 text-emerald-400" />}
                      <span>{isAI ? 'Margarita AI' : 'Prospecto'}</span>
                      {item.provider && (
                        <span className="text-indigo-400 font-mono">({item.provider})</span>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isAI
                          ? 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-100 rounded-tl-sm'
                          : 'bg-gray-800 text-white rounded-tr-sm'
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })}

              {testingAi && (
                <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse pl-2">
                  <Bot className="w-4 h-4" />
                  <span>El agente de IA está razonando la respuesta...</span>
                </div>
              )}
            </div>
          </div>

          {/* Test Input bar */}
          <div className="pt-3 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTestChat()}
                placeholder="Escribe una consulta de prueba..."
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                disabled={testingAi || !testPrompt.trim()}
                onClick={handleTestChat}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Probar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
