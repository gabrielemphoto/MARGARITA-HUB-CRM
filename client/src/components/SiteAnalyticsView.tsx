import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const SiteAnalyticsView: React.FC = () => {
  const stepDropoff = [
    { name: '1. Registro', visitas: 2310, dropoff: '100%' },
    { name: '2. VSL / Clase', visitas: 1420, dropoff: '61.4%' },
    { name: '3. Checkout', visitas: 498, dropoff: '21.5%' },
    { name: '4. Compra VIP', visitas: 107, dropoff: '4.6%' }
  ];

  const deviceData = [
    { name: 'Móvil (WhatsApp / IG)', value: 68, color: '#6366f1' },
    { name: 'Escritorio', value: 26, color: '#10b981' },
    { name: 'Tablet', value: 6, color: '#f59e0b' }
  ];

  const sourceData = [
    { source: 'WhatsApp Directo', leads: 480, rate: '28.4%' },
    { source: 'Instagram Stories & Bio', leads: 395, rate: '22.1%' },
    { source: 'Pauta Publicitaria Meta Ads', leads: 610, rate: '18.9%' },
    { source: 'Chat Web Orgánico', leads: 185, rate: '34.2%' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Analítica de Conversión y Tráfico Web
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Embudo Detallado
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Monitorea el flujo de visitantes por cada etapa de tus embudos, tasa de abandono y fuentes de adquisición.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step-by-Step Dropoff */}
        <div className="lg:col-span-8 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Flujo de Abandono y Retención por Paso</h2>
            <span className="text-xs text-emerald-400 font-bold">+4.6% conversión final</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stepDropoff} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                <YAxis stroke="#6b7280" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="visitas" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Devices breakdown */}
        <div className="lg:col-span-4 bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1">Dispositivos de Entrada</h2>
            <p className="text-xs text-gray-400 mb-4">Optimización recomendada: 9:16 móvil</p>

            <div className="space-y-3">
              {deviceData.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="text-gray-300 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-white">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-950 border border-gray-800/80 text-[11px] text-gray-400">
            El 68% de los prospectos completan sus datos desde WhatsApp o navegador de Instagram.
          </div>
        </div>
      </div>

      {/* Traffic Sources Table */}
      <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-5">
        <h2 className="text-sm font-bold text-white mb-3">Fuentes de Adquisición de Tráfico</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Fuente de Tráfico</th>
                <th className="py-2.5 px-3">Prospectos Captados</th>
                <th className="py-2.5 px-3">Tasa de Conversión a Venta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {sourceData.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-800/40">
                  <td className="py-3 px-3 font-semibold text-white">{s.source}</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{s.leads}</td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{s.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
