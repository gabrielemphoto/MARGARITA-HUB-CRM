import React from 'react';
import {
  Mail,
  Send,
  Plus,
  TrendingUp,
  MousePointer,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import { EmailCampaign } from '../types';

interface MarketingViewProps {
  campaigns: EmailCampaign[];
}

export const MarketingView: React.FC<MarketingViewProps> = ({ campaigns }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Campañas Masivas de Email Marketing
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Alta Entregabilidad
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Envía boletines, promociones y lanzamientos segmentados con analítica de apertura y clics en tiempo real.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <Send className="w-3.5 h-3.5" />
          <span>Nueva Campaña Masiva</span>
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-12 text-center text-xs text-gray-500">
          <Mail className="w-8 h-8 text-indigo-400/30 mx-auto mb-2" />
          No hay campañas de email masivo enviadas todavía. Haz clic en "Nueva Campaña Masiva" para redactar una.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(camp => (
          <div
            key={camp.id}
            className="bg-gray-900/60 border border-gray-800/80 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                  {camp.status === 'sent' ? 'Enviada' : camp.status}
                </span>
                <span className="text-[11px] text-gray-500 font-mono">{camp.sentAt}</span>
              </div>

              <h3 className="font-bold text-sm text-white mb-1 group-hover:text-indigo-300 transition-colors">
                {camp.name}
              </h3>
              <p className="text-xs text-gray-400 italic mb-4">
                Asunto: "{camp.subject}"
              </p>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-gray-950 border border-gray-800 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px]">Destinatarios</span>
                  <span className="font-bold text-white font-mono">{camp.recipientsCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Tasa de Apertura</span>
                  <span className="font-bold text-indigo-400 font-mono">{camp.openRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">Tasa de Clics</span>
                  <span className="font-bold text-emerald-400 font-mono">{camp.clickRate}%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
              <span className="text-indigo-400 font-semibold cursor-pointer hover:underline">
                Ver Informe Detallado
              </span>
              <span className="text-gray-500 text-[11px]">Resend / SMTP Activo</span>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
