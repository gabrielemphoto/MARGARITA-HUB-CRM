import React, { useState } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Mail,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { InstagramIcon as Instagram, FacebookIcon as Facebook } from './CustomIcons';
import { api } from '../api';

interface IncomingSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: () => void;
}

export const IncomingSimulatorModal: React.FC<IncomingSimulatorModalProps> = ({
  isOpen,
  onClose,
  onMessageSent
}) => {
  const [channel, setChannel] = useState<'whatsapp' | 'instagram' | 'facebook' | 'email' | 'webchat'>('whatsapp');
  const [senderName, setSenderName] = useState('Sofía Navarro');
  const [senderId, setSenderId] = useState('+34 655 432 109');
  const [text, setText] = useState('¡Hola! Vi sus embudos de venta y quisiera saber precios y si incluye agente de IA para WhatsApp 24/7.');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: 'Preguntar por Precios', text: 'Hola, ¿cuánto cuesta el plan con agentes de IA y embudos ilimitados?' },
    { label: 'Solicitar Agendamiento', text: 'Me gustaría agendar una demostración en vivo de 20 minutos, ¿tienen disponibilidad mañana?' },
    { label: 'Consultar por WhatsApp', text: '¿Pueden conectar la IA a mi número de WhatsApp comercial existente?' },
    { label: 'Traspaso a Humano', text: 'Tengo un caso muy específico y requiero hablar con un asesor humano por favor.' }
  ];

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setLastResult(null);

    try {
      const res = await api.simulateIncomingMessage({
        channel,
        senderId,
        senderName,
        text
      });
      setLastResult(res);
      onMessageSent();
    } catch (err: any) {
      console.error(err);
      alert('Error al simular mensaje: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Simulador Multicanal 24/7 & Motor de IA
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  En Vivo
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Prueba cómo MARGARITA HUB CRM recibe mensajes y responde autónomamente 24/7 en cualquier canal.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Channel Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">
              1. Selecciona el Canal de Entrada:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-400', activeBg: 'border-emerald-500/50 bg-emerald-500/10' },
                { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400', activeBg: 'border-pink-500/50 bg-pink-500/10' },
                { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400', activeBg: 'border-blue-500/50 bg-blue-500/10' },
                { id: 'email', label: 'Email', icon: Mail, color: 'text-amber-400', activeBg: 'border-amber-500/50 bg-amber-500/10' },
                { id: 'webchat', label: 'Web Chat', icon: Bot, color: 'text-indigo-400', activeBg: 'border-indigo-500/50 bg-indigo-500/10' }
              ].map(ch => {
                const Icon = ch.icon;
                const isSelected = channel === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setChannel(ch.id as any);
                      if (ch.id === 'whatsapp') setSenderId('+34 655 432 109');
                      else if (ch.id === 'instagram') setSenderId('@sofia.growth');
                      else if (ch.id === 'facebook') setSenderId('fb_user_88219');
                      else if (ch.id === 'email') setSenderId('sofia@growthbrands.com');
                      else setSenderId('web_user_771');
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition ${
                      isSelected
                        ? `${ch.activeBg} text-white shadow-sm ring-1 ring-white/10`
                        : 'border-gray-800 bg-gray-950/40 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1 ${ch.color}`} />
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Nombre del Prospecto:
              </label>
              <input
                type="text"
                value={senderName}
                onChange={e => setSenderName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Identificador (Teléfono / Usuario / Email):
              </label>
              <input
                type="text"
                value={senderId}
                onChange={e => setSenderId(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Quick Prompts */}
          <div>
            <label className="text-xs font-semibold text-gray-400 block mb-1.5">
              Plantillas Rápidas de Prueba:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setText(qp.text)}
                  className="px-2.5 py-1 rounded-md bg-gray-800/60 hover:bg-gray-800 text-[11px] text-gray-300 border border-gray-700/50 transition"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message text */}
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">
              Mensaje del Cliente:
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Escribe lo que el prospecto enviaría por este canal..."
            />
          </div>

          {/* Live Result Display */}
          {lastResult && (
            <div className="p-4 rounded-xl bg-gray-950/80 border border-indigo-500/30 space-y-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300 pb-2 border-b border-gray-800">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Mensaje Recibido & Procesado en Servidor
                </span>
                <span className="text-gray-400 text-[11px]">Canal: {lastResult.conversation?.channel?.toUpperCase()}</span>
              </div>

              {/* Contact message */}
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center shrink-0 text-gray-300 text-[10px] font-bold">
                  {senderName.charAt(0)}
                </div>
                <div className="flex-1 bg-gray-800/80 rounded-xl rounded-tl-none p-2.5 text-xs text-gray-200">
                  <div className="text-[10px] text-gray-400 font-semibold mb-0.5">{senderName}</div>
                  {lastResult.message?.text}
                </div>
              </div>

              {/* AI Autonomous Reply */}
              {lastResult.aiReply ? (
                <div className="flex items-start gap-2.5 pl-6">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shrink-0 text-indigo-400 text-[10px]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 bg-indigo-950/40 border border-indigo-500/30 rounded-xl rounded-tl-none p-3 text-xs text-indigo-100 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold mb-1">
                      <span>{lastResult.aiReply.senderName}</span>
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Respuesta 24/7 Autopilot
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">{lastResult.aiReply.text}</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-amber-400/90 pl-6">
                  (El piloto automático de IA está desactivado para este contacto o canal)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Conectado al bus en tiempo real de MARGARITA HUB CRM
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              Cerrar
            </button>
            <button
              type="button"
              disabled={loading || !text.trim()}
              onClick={handleSend}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
            >
              {loading ? (
                <span>Procesando con IA...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar y Ver Respuesta 24/7</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
