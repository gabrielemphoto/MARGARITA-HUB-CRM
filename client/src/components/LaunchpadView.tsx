import React from 'react';
import {
  Rocket,
  CheckCircle2,
  Circle,
  MessageCircle,
  Mail,
  Bot,
  CreditCard,
  QrCode,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { InstagramIcon as Instagram, FacebookIcon as Facebook } from './CustomIcons';
import { IntegrationSettings, AISettings, ActiveModule } from '../types';

interface LaunchpadViewProps {
  integrations?: IntegrationSettings;
  aiSettings?: AISettings;
  onNavigate: (module: ActiveModule) => void;
  onOpenSimulator: () => void;
}

export const LaunchpadView: React.FC<LaunchpadViewProps> = ({
  integrations,
  aiSettings,
  onNavigate,
  onOpenSimulator
}) => {
  const steps = [
    {
      id: 'ai',
      title: 'Conectar Motor de Inteligencia Artificial (24/7)',
      desc: 'Selecciona OpenAI, Google Gemini, Anthropic Claude, Groq o tu servidor local Ollama para responder mensajes.',
      icon: Bot,
      completed: Boolean(aiSettings?.apiKey || aiSettings?.provider),
      actionLabel: 'Configurar IA',
      targetModule: 'ai-agents' as ActiveModule,
      badge: aiSettings?.provider?.toUpperCase() || 'Pendiente'
    },
    {
      id: 'whatsapp',
      title: 'Integrar WhatsApp Cloud API',
      desc: 'Conecta tu número oficial de WhatsApp Business para envío de flujos, confirmaciones y chat en vivo.',
      icon: MessageCircle,
      completed: integrations?.whatsapp?.status === 'connected',
      actionLabel: 'Gestionar WhatsApp',
      targetModule: 'integrations' as ActiveModule,
      badge: integrations?.whatsapp?.status === 'connected' ? 'Conectado' : 'Sin vincular'
    },
    {
      id: 'instagram',
      title: 'Conectar Instagram Direct Messaging',
      desc: 'Responde comentarios, stories y mensajes directos de forma autónoma con tu asistente de IA.',
      icon: Instagram,
      completed: integrations?.instagram?.status === 'connected',
      actionLabel: 'Vincular Instagram',
      targetModule: 'integrations' as ActiveModule,
      badge: integrations?.instagram?.status === 'connected' ? 'Conectado' : 'Sin vincular'
    },
    {
      id: 'email',
      title: 'Configurar Servicio de Correo Electrónico',
      desc: 'Habilita SMTP o API de Resend para notificaciones, seguimiento de clics y campañas masivas.',
      icon: Mail,
      completed: integrations?.email?.status === 'connected',
      actionLabel: 'Ajustes de Email',
      targetModule: 'integrations' as ActiveModule,
      badge: integrations?.email?.status === 'connected' ? 'Conectado' : 'Sin vincular'
    },
    {
      id: 'payments',
      title: 'Activar Pasarela de Pagos (Stripe / PayPal)',
      desc: 'Recibe pagos en formularios, membresías, productos digitales y servicios de consultoría.',
      icon: CreditCard,
      completed: integrations?.stripe?.status === 'connected',
      actionLabel: 'Configurar Pagos',
      targetModule: 'payments' as ActiveModule,
      badge: integrations?.stripe?.status === 'connected' ? 'Activo' : 'Pendiente'
    },
    {
      id: 'widget',
      title: 'Instalar Burbuja de Chat Web & Código QR',
      desc: 'Incrusta el widget de Margarita Hub en tu sitio corporativo o genera el QR para tus stands y tarjetas.',
      icon: QrCode,
      completed: true,
      actionLabel: 'Ver Código de Widget',
      targetModule: 'widget-qr' as ActiveModule,
      badge: 'Listo'
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-purple-950/80 to-gray-950 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-3">
            <Rocket className="w-3.5 h-3.5" /> Launchpad de Bienvenida
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-2">
            Configuración Rápida de tu Plataforma MARGARITA HUB CRM
          </h1>
          <p className="text-sm text-gray-300 leading-relaxed mb-6">
            Conecta tus canales de comunicación, activa los agentes de IA 24/7 y prepara tus embudos para comenzar a captar leads y cerrar ventas en piloto automático.
          </p>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-300">Progreso de Integraciones de la Cuenta</span>
              <span className="text-indigo-400">{progressPercent}% completado ({completedCount}/{steps.length})</span>
            </div>
            <div className="w-full h-2.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="bg-gray-900/60 border border-gray-800/80 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {step.title}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          step.completed
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {step.badge}
                      </span>
                    </div>
                  </div>

                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-600 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  {step.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(step.targetModule)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:underline"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {step.id === 'ai' && (
                  <button
                    onClick={onOpenSimulator}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" /> Probar en vivo
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
