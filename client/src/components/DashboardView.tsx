import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Bot,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardViewProps {
  data: any;
  onNavigate: (module: any) => void;
  onSelectContact: (contact: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onNavigate,
  onSelectContact
}) => {
  if (!data || !data.kpis) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Cargando métricas del panel de control...
      </div>
    );
  }

  const { kpis, stageDistribution, funnelsData, channelStats, recentActivity } = data;

  const funnelChartData = (funnelsData || []).map((f: any) => ({
    name: f.name.length > 20 ? f.name.slice(0, 18) + '...' : f.name,
    Visitas: f.visits,
    Conversiones: f.conversions
  }));

  const pieColors = ['#3b82f6', '#eab308', '#8b5cf6', '#f97316', '#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Tablero de Control y Analítica Visual
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
              Tiempo Real
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Monitoreo en vivo de pipelines comerciales, conversión de embudos y atención IA 24/7.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>Últimos 30 días</span>
          </div>
          <button
            onClick={() => onNavigate('funnels')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ver Embudos</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Oportunidades</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.totalOpportunities}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+18% este mes</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Valor del Pipeline</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${kpis.pipelineValue?.toLocaleString()} <span className="text-xs font-normal text-gray-400">USD</span>
          </div>
          <div className="text-[11px] text-gray-400 mt-2">En proceso de cierre</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Tasa de Conversión</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.conversionRate}</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>Supera meta (15%)</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs mb-2">
            <span>Ingresos Ganados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            ${kpis.wonRevenue?.toLocaleString()} <span className="text-xs font-normal text-gray-400">USD</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-2">Ventas cerradas</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-gray-900/60 border border-indigo-500/30 rounded-xl p-4 flex flex-col justify-between bg-gradient-to-br from-indigo-950/20 to-purple-950/20">
          <div className="flex items-center justify-between text-indigo-300 text-xs mb-2">
            <span>IA 24/7 Autopilot</span>
            <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.activeAIInteractions} chats</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2 font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Atendiendo sin código</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Performance BarChart */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Rendimiento de Embudos de Venta</h2>
              <p className="text-xs text-gray-400">Comparativa de Visitas vs Conversiones directas</p>
            </div>
            <button
              onClick={() => onNavigate('funnels')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Ver Detalle
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Visitas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Conversiones" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Stage Distribution */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white">Distribución por Fases</h2>
              <button
                onClick={() => onNavigate('pipelines')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Ver Pipeline
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">Prospectos activos en cada etapa comercial</p>

            <div className="space-y-2.5">
              {stageDistribution?.map((st: any, i: number) => (
                <div key={st.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: st.color || pieColors[i % pieColors.length] }}
                    ></span>
                    <span className="text-gray-300 font-medium">{st.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-semibold">{st.count} leads</span>
                    <span className="text-indigo-400 font-bold">${st.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-400">
            <span>Canales Activos:</span>
            <div className="flex items-center gap-2 font-mono text-[11px] text-gray-300">
              <span className="text-emerald-400">WA: {channelStats?.whatsapp || 0}</span>
              <span className="text-pink-400">IG: {channelStats?.instagram || 0}</span>
              <span className="text-blue-400">FB: {channelStats?.facebook || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">Actividad Reciente de Prospectos</h2>
            <p className="text-xs text-gray-400">Interacciones registradas en el CRM y canales de venta</p>
          </div>
          <button
            onClick={() => onNavigate('contacts')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Ver Todos los Contactos
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 font-semibold">
                <th className="pb-2.5">Contacto</th>
                <th className="pb-2.5">Empresa</th>
                <th className="pb-2.5">Etapa Actual</th>
                <th className="pb-2.5">Valor Oportunidad</th>
                <th className="pb-2.5">Lead Score</th>
                <th className="pb-2.5">Última Actividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-gray-200">
              {(!recentActivity || recentActivity.length === 0) ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-gray-500">
                    No hay prospectos ni interacciones registradas aún. Haz clic en "Ver Todos los Contactos" para registrar tu primer lead o conecta tus canales.
                  </td>
                </tr>
              ) : (
                recentActivity.map((act: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-800/40 cursor-pointer transition"
                    onClick={() => onNavigate('contacts')}
                  >
                    <td className="py-3 font-semibold text-white">{act.contact}</td>
                    <td className="py-3 text-gray-400">{act.company || '-'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-semibold">
                        {act.stage}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-emerald-400">${act.value?.toLocaleString()} USD</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${act.leadScore || 50}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-[11px] text-gray-400">{act.leadScore}/100</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-400">{act.activity}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
