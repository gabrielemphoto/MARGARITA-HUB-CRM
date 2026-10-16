import React, { useState } from 'react';
import {
  Layers,
  Split,
  Globe,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Percent,
  ExternalLink,
  Edit3,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Funnel, FunnelStep } from '../types';
import { api } from '../api';

interface FunnelsViewProps {
  funnels: Funnel[];
  onRefresh: () => void;
}

export const FunnelsView: React.FC<FunnelsViewProps> = ({ funnels, onRefresh }) => {
  const [selectedFunnelId, setSelectedFunnelId] = useState<string>(funnels[0]?.id || '');
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);

  const activeFunnel = funnels.find(f => f.id === selectedFunnelId) || funnels[0];

  const handleToggleAB = async () => {
    if (!activeFunnel) return;
    try {
      await api.updateFunnel(activeFunnel.id, {
        abTestingEnabled: !activeFunnel.abTestingEnabled
      });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAiSeo = async () => {
    if (!activeFunnel) return;
    setGeneratingSeo(true);
    try {
      const seo = await api.generateSEO({
        pageTitle: activeFunnel.name,
        businessType: 'Embudos de Alta Conversión y Agentes de IA',
        targetAudience: 'Emprendedores y Negocios B2B'
      });
      await api.updateFunnel(activeFunnel.id, { aiSeo: seo });
      onRefresh();
      setShowSeoModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingSeo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Constructor de Embudos de Venta (Funnels)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Drag & Drop + Pruebas A/B
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Diseña secuencias de páginas de alta conversión para captar leads, agendar llamadas y recibir pagos.
          </p>
        </div>

        {/* Funnel selector tabs */}
        <div className="flex items-center gap-2">
          <select
            value={activeFunnel?.id || ''}
            onChange={e => setSelectedFunnelId(e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            {funnels.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeFunnel && (
        <div className="space-y-6">
          {/* Funnel Overview Card */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase">
                    {activeFunnel.status}
                  </span>
                  <h2 className="text-lg font-bold text-white">{activeFunnel.name}</h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
                  <Globe className="w-3.5 h-3.5" />
                  <span>https://{activeFunnel.domain}</span>
                </div>
              </div>

              {/* Action Tools */}
              <div className="flex items-center gap-2">
                {/* A/B Testing Toggle */}
                <button
                  onClick={handleToggleAB}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    activeFunnel.abTestingEnabled
                      ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400'
                  }`}
                  title="Dividir tráfico 50/50 entre página de control y variación"
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>Pruebas A/B: {activeFunnel.abTestingEnabled ? 'Activas (50/50)' : 'Desactivadas'}</span>
                </button>

                {/* AI SEO Button */}
                <button
                  onClick={() => setShowSeoModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Parámetros SEO con IA</span>
                </button>
              </div>
            </div>

            {/* Funnel Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-3.5">
                <span className="text-[11px] text-gray-400 block mb-1">Visitas Totales</span>
                <span className="text-xl font-bold text-white">{activeFunnel.totalVisits.toLocaleString()}</span>
              </div>
              <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-3.5">
                <span className="text-[11px] text-gray-400 block mb-1">Conversiones Totales</span>
                <span className="text-xl font-bold text-emerald-400">{activeFunnel.totalConversions.toLocaleString()}</span>
              </div>
              <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-3.5">
                <span className="text-[11px] text-gray-400 block mb-1">Tasa de Conversión</span>
                <span className="text-xl font-bold text-indigo-400">
                  {((activeFunnel.totalConversions / (activeFunnel.totalVisits || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-gray-950/70 border border-gray-800/80 rounded-xl p-3.5">
                <span className="text-[11px] text-gray-400 block mb-1">Ingresos Generados</span>
                <span className="text-xl font-bold text-emerald-400">
                  ${activeFunnel.totalRevenue.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Interactive Countdown Timer & Progress Bar Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-gray-950 border border-indigo-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <Clock className="w-4 h-4" /> Componente Nativo: Temporizador de Cuenta Atrás & Barra de Progreso
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Oferta por Tiempo Limitado</span>
              </div>

              {/* Countdown timer clock */}
              <div className="flex items-center gap-2">
                {[
                  { val: '02', label: 'DÍAS' },
                  { val: '14', label: 'HORAS' },
                  { val: '38', label: 'MINUTOS' },
                  { val: '45', label: 'SEGUNDOS' }
                ].map((item, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg text-center">
                    <span className="text-base font-extrabold text-white font-mono">{item.val}</span>
                    <span className="text-[8px] text-gray-400 block tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Funnel Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Paso 2 de 4: Reserva y Pago</span>
                  <span className="text-indigo-400 font-bold">50% Completado</span>
                </div>
                <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 w-1/2 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Funnel Flow */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Pasos del Embudo (Secuencia de Conversión)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {activeFunnel.steps.map((step, idx) => {
                  const convRate = step.visits > 0 ? ((step.conversions / step.visits) * 100).toFixed(1) : '0';
                  return (
                    <div
                      key={step.id}
                      className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-500/40 transition shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between text-gray-500 text-[10px] font-mono mb-2">
                          <span>PASO {idx + 1}</span>
                          <span className="uppercase text-indigo-400 font-semibold">{step.type}</span>
                        </div>

                        <h4 className="font-bold text-xs text-white mb-1">{step.name}</h4>
                        <div className="text-[11px] text-gray-400 font-mono mb-3">{step.path}</div>

                        <div className="space-y-1.5 text-xs pt-2 border-t border-gray-800">
                          <div className="flex justify-between text-gray-400">
                            <span>Visitas:</span>
                            <span className="text-white font-semibold">{step.visits.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Conversiones:</span>
                            <span className="text-emerald-400 font-semibold">{step.conversions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-400">
                            <span>Tasa de Paso:</span>
                            <span className="text-indigo-400 font-bold">{convRate}%</span>
                          </div>
                        </div>

                        {activeFunnel.abTestingEnabled && (
                          <div className="mt-3 p-2 rounded-lg bg-gray-900 border border-gray-800 text-[10px] space-y-1">
                            <div className="text-purple-300 font-bold flex items-center justify-between">
                              <span>Prueba A/B (50/50):</span>
                              <Split className="w-3 h-3" />
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Variación A:</span>
                              <span className="text-white">{step.aSplitVisits}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Variación B:</span>
                              <span className="text-white">{step.bSplitVisits}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-gray-800 flex items-center justify-between text-xs">
                        <span className="text-indigo-400 text-[11px] font-semibold cursor-pointer hover:underline">
                          Editar Página
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 hover:text-white cursor-pointer" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI SEO Settings Modal */}
      {showSeoModal && activeFunnel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Parámetros de SEO con Inteligencia Artificial</h3>
              </div>
              <button
                onClick={() => setShowSeoModal(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Meta Título (SEO Title)</label>
                <input
                  type="text"
                  value={activeFunnel.aiSeo?.metaTitle || ''}
                  onChange={e => {
                    activeFunnel.aiSeo.metaTitle = e.target.value;
                  }}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Meta Descripción</label>
                <textarea
                  rows={3}
                  value={activeFunnel.aiSeo?.metaDescription || ''}
                  onChange={e => {
                    activeFunnel.aiSeo.metaDescription = e.target.value;
                  }}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white resize-none"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Palabras Clave (Keywords)</label>
                <div className="flex flex-wrap gap-1 p-2 bg-gray-950 border border-gray-800 rounded-lg">
                  {activeFunnel.aiSeo?.keywords?.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px]">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-semibold">Imagen Social OpenGraph (og:image)</label>
                <input
                  type="text"
                  value={activeFunnel.aiSeo?.ogImage || ''}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2 text-gray-400 font-mono text-[11px]"
                  readOnly
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
              <button
                type="button"
                disabled={generatingSeo}
                onClick={handleGenerateAiSeo}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-purple-600/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generatingSeo ? 'Generando con IA...' : 'Auto-Optimizar con IA'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSeoModal(false)}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
              >
                Guardar SEO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
