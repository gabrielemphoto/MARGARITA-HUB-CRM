import React from 'react';
import {
  Rocket,
  LayoutDashboard,
  Users,
  GitBranch,
  MessageSquare,
  Calendar,
  Layers,
  FileText,
  HelpCircle,
  Globe,
  Video,
  ShieldCheck,
  QrCode,
  BarChart3,
  Bot,
  Workflow as WorkflowIcon,
  CreditCard,
  GraduationCap,
  Mail,
  HardDrive,
  Award,
  Settings,
  ChevronRight
} from 'lucide-react';
import { ActiveModule } from '../types';

interface SidebarProps {
  currentModule: ActiveModule;
  onSelectModule: (module: ActiveModule) => void;
  unreadMessagesCount?: number;
}

interface NavGroup {
  title: string;
  items: {
    id: ActiveModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  unreadMessagesCount = 0
}) => {
  const groups: NavGroup[] = [
    {
      title: '1. GESTIÓN COMERCIAL Y CRM',
      items: [
        { id: 'launchpad', label: 'Launchpad', icon: Rocket },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'contacts', label: 'Contactos', icon: Users },
        { id: 'pipelines', label: 'Oportunidades (Pipelines)', icon: GitBranch },
        {
          id: 'social',
          label: 'Social (Comunicaciones)',
          icon: MessageSquare,
          badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined
        },
        { id: 'calendars', label: 'Calendarios', icon: Calendar }
      ]
    },
    {
      title: '2. SITIOS Y CAPTACIÓN',
      items: [
        { id: 'funnels', label: 'Embudos (Funnels)', icon: Layers },
        { id: 'forms', label: 'Formularios', icon: FileText },
        { id: 'surveys', label: 'Encuestas y Quizzes', icon: HelpCircle },
        { id: 'sites', label: 'Sitios, Tiendas y Blogs', icon: Globe },
        { id: 'webinars', label: 'Seminarios Web (Webinars)', icon: Video },
        { id: 'portal', label: 'Portal del Cliente', icon: ShieldCheck },
        { id: 'widget-qr', label: 'Widget de Chat y Códigos QR', icon: QrCode },
        { id: 'site-analytics', label: 'Analítica de Sitios', icon: BarChart3 }
      ]
    },
    {
      title: '3. AUTOMATIZACIÓN Y AGENTES AI',
      items: [
        { id: 'ai-agents', label: 'Agentes de AI (24/7)', icon: Bot, badge: 'PRO' },
        { id: 'workflows', label: 'Flujos de Trabajo (Workflows)', icon: WorkflowIcon }
      ]
    },
    {
      title: '4. MONETIZACIÓN Y FORMACIÓN',
      items: [
        { id: 'payments', label: 'Pagos y Facturación', icon: CreditCard },
        { id: 'memberships', label: 'Membresías (Cursos)', icon: GraduationCap },
        { id: 'marketing', label: 'Marketing Masivo', icon: Mail },
        { id: 'storage', label: 'Almacenamiento Cloud', icon: HardDrive },
        { id: 'reputation', label: 'Reputación e Informes', icon: Award }
      ]
    },
    {
      title: 'SISTEMA Y CONEXIONES',
      items: [
        { id: 'integrations', label: 'Integraciones y APIs', icon: Settings }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800/80 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-y-auto">
      <div className="p-3 space-y-6">
        {groups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-white border border-indigo-500/40 shadow-sm'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            typeof item.badge === 'number'
                              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                              : 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="mt-auto p-3 border-t border-gray-900 bg-gray-950/60">
        <div className="rounded-xl p-2.5 bg-gradient-to-br from-indigo-950/40 to-purple-950/30 border border-indigo-900/30">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              24/7 AI Autopilot
            </span>
            <span className="text-emerald-400 text-[10px]">Listo</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-tight">
            Escuchando WhatsApp, Instagram, Facebook y Webchat.
          </p>
        </div>
      </div>
    </aside>
  );
};
