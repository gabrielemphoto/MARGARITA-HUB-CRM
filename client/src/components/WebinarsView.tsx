import React from 'react';
import {
  Video,
  Calendar,
  Users,
  Clock,
  ExternalLink,
  Plus,
  Play,
  Sparkles
} from 'lucide-react';
import { WebinarItem } from '../types';

interface WebinarsViewProps {
  webinars: WebinarItem[];
}

export const WebinarsView: React.FC<WebinarsViewProps> = ({ webinars }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Seminarios Web y Lanzamientos en Directo
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Webinars Automatizados & En Vivo
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Estructura lanzamientos, clases maestras y conferencias con registros automatizados y recordatorios multicanal.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Webinar</span>
        </button>
      </div>

      <div className="space-y-4">
        {webinars.map(web => (
          <div
            key={web.id}
            className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                  Lanzamiento Programado
                </span>
                <span className="text-xs text-gray-400">Host: {web.host}</span>
              </div>

              <h3 className="text-base font-bold text-white">{web.title}</h3>

              <div className="flex flex-wrap gap-4 text-xs text-gray-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{web.scheduledDate} a las {web.scheduledTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-white">{web.registeredCount}</span> registrados
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={web.liveRoomUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Entrar a Sala de Emisión</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
