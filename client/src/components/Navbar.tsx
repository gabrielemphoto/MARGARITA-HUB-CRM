import React from 'react';
import {
  Sparkles,
  Bot,
  MessageCircle,
  Mail,
  Plus,
  Play,
  Search,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { InstagramIcon as Instagram, FacebookIcon as Facebook } from './CustomIcons';
import { AISettings, IntegrationSettings } from '../types';

interface NavbarProps {
  aiSettings?: AISettings;
  integrations?: IntegrationSettings;
  onOpenSimulator: () => void;
  onOpenNewLead: () => void;
  onNavigate: (module: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  aiSettings,
  integrations,
  onOpenSimulator,
  onOpenNewLead,
  onNavigate
}) => {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand Logo & Tagline */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg tracking-wider text-white bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
              MARGARITA
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-semibold tracking-wide">
              HUB CRM
            </span>
          </div>
          <p className="text-[10px] text-gray-400 -mt-0.5 hidden sm:block">
            Suite All-in-One CRM, Funnels & Agentes de IA 24/7
          </p>
        </div>
      </div>

      {/* Global Channel & AI Status Badges */}
      <div className="hidden lg:flex items-center gap-4 bg-gray-900/60 border border-gray-800/80 px-3.5 py-1.5 rounded-full">
        {/* 24/7 AI Status */}
        <div
          onClick={() => onNavigate('ai-agents')}
          className="flex items-center gap-2 cursor-pointer group pr-3 border-r border-gray-800"
          title="Configurar Agente de IA 24/7"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="absolute w-4 h-4 rounded-full bg-emerald-400/30 animate-ping"></span>
          </div>
          <Bot className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-gray-300">
            IA 24/7: <span className="text-emerald-400 font-semibold">{aiSettings?.provider?.toUpperCase() || 'ACTIVO'}</span>
          </span>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span
            onClick={() => onNavigate('integrations')}
            className={`flex items-center gap-1 cursor-pointer transition ${
              integrations?.whatsapp?.status === 'connected' ? 'text-emerald-400 hover:text-emerald-300' : 'text-gray-500 hover:text-gray-400'
            }`}
            title="WhatsApp Cloud API"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">WhatsApp</span>
          </span>

          <span
            onClick={() => onNavigate('integrations')}
            className={`flex items-center gap-1 cursor-pointer transition ${
              integrations?.instagram?.status === 'connected' ? 'text-pink-400 hover:text-pink-300' : 'text-gray-500 hover:text-gray-400'
            }`}
            title="Instagram Direct API"
          >
            <Instagram className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Instagram</span>
          </span>

          <span
            onClick={() => onNavigate('integrations')}
            className={`flex items-center gap-1 cursor-pointer transition ${
              integrations?.facebook?.status === 'connected' ? 'text-blue-400 hover:text-blue-300' : 'text-gray-500 hover:text-gray-400'
            }`}
            title="Facebook Messenger"
          >
            <Facebook className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Facebook</span>
          </span>

          <span
            onClick={() => onNavigate('integrations')}
            className={`flex items-center gap-1 cursor-pointer transition ${
              integrations?.email?.status === 'connected' ? 'text-amber-400 hover:text-amber-300' : 'text-gray-500 hover:text-gray-400'
            }`}
            title="Email Multicanal"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Email</span>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Simulate Incoming Message Button */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:bg-purple-600/30 transition shadow-sm"
          title="Simular mensaje entrante por WhatsApp/Instagram y ver respuesta IA"
        >
          <Play className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
          <span className="hidden md:inline">Simular Mensaje 24/7</span>
        </button>

        {/* New Lead Button */}
        <button
          onClick={onOpenNewLead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nuevo Lead</span>
        </button>

        {/* Notifications / User */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/30">
          MH
        </div>
      </div>
    </header>
  );
};
