import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  MessageCircle,
  Mail,
  Bot,
  Send,
  Sparkles,
  User,
  Clock,
  CheckCheck,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Plus,
  ExternalLink,
  X
} from 'lucide-react';
import { InstagramIcon as Instagram, FacebookIcon as Facebook } from './CustomIcons';
import { Conversation, ConversationMessage, Contact } from '../types';
import { api } from '../api';
import { callRealAIProvider } from '../services/liveAiService';

interface SocialInboxViewProps {
  conversations: Conversation[];
  contacts: Contact[];
  onOpenSimulator: () => void;
  onRefresh: () => void;
  preselectedContact?: Contact | null;
}

export const SocialInboxView: React.FC<SocialInboxViewProps> = ({
  conversations,
  contacts,
  onOpenSimulator,
  onRefresh,
  preselectedContact
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [draftingAI, setDraftingAI] = useState(false);

  // New Chat Modal State
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatChannel, setNewChatChannel] = useState<'whatsapp' | 'instagram' | 'email'>('whatsapp');
  const [newChatPhoneOrId, setNewChatPhoneOrId] = useState('+58 412 359 0065');
  const [newChatInitialText, setNewChatInitialText] = useState('¡Hola! Te contactamos desde MARGARITA HUB CRM.');
  const [creatingChat, setCreatingChat] = useState(false);

  // Set initial selected conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConvId) {
      if (preselectedContact) {
        const found = conversations.find(c => c.contactId === preselectedContact.id);
        if (found) {
          setSelectedConvId(found.id);
          return;
        }
      }
      setSelectedConvId(conversations[0].id);
    }
  }, [conversations, preselectedContact]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConvId) return;
    setLoadingMessages(true);
    api.getMessages(selectedConvId)
      .then(msgs => {
        setMessages(msgs);
        setLoadingMessages(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingMessages(false);
      });
  }, [selectedConvId]);

  const activeConversation = conversations.find(c => c.id === selectedConvId);
  const activeContact = contacts.find(c => c.id === activeConversation?.contactId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConvId) return;

    const textToSend = inputText;
    setInputText('');

    try {
      const newMsg = await api.sendMessage(selectedConvId, textToSend, 'Asesor Humano');
      setMessages(prev => [...prev, newMsg]);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAutopilot = async () => {
    if (!activeConversation) return;
    try {
      const nextState = !activeConversation.aiAutoPilot;
      await api.toggleAutopilot(activeConversation.id, nextState);
      activeConversation.aiAutoPilot = nextState;
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAiAssist = async () => {
    if (!activeConversation) return;
    setDraftingAI(true);
    try {
      const historyItems = messages.slice(-5).map(m => ({ sender: m.sender, text: m.text }));
      const aiSettings = await api.getAISettings();
      const lastContactMsg = messages.filter(m => m.sender === 'contact').slice(-1)[0]?.text || 'Hola, deseo cotizar sus servicios.';

      const res = await callRealAIProvider(
        aiSettings,
        `Redacta una respuesta comercial profesional y cordial para responder al cliente que dice: "${lastContactMsg}". Ofrece nuestro enlace oficial para agendar una llamada.`,
        historyItems,
        activeContact
      );

      if (res && res.reply) {
        setInputText(res.reply);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDraftingAI(false);
    }
  };

  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatName.trim() || !newChatPhoneOrId.trim()) return;
    setCreatingChat(true);
    try {
      const res = await api.startRealConversation({
        contactName: newChatName.trim(),
        phoneOrIdentifier: newChatPhoneOrId.trim(),
        channel: newChatChannel,
        initialMessage: newChatInitialText.trim()
      });
      setIsNewChatOpen(false);
      setNewChatName('');
      if (res?.conversation?.id) {
        setSelectedConvId(res.conversation.id);
      }
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error al iniciar conversación');
    } finally {
      setCreatingChat(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (channelFilter === 'all') return true;
    return c.channel === channelFilter;
  });

  const getChannelIcon = (ch: string) => {
    switch (ch) {
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-amber-400" />;
      default:
        return <Bot className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Social & Comunicaciones Omnicanal
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              24/7 AI Engine Conectado
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Inbox unificado para WhatsApp, Instagram DM, Facebook Messenger, Email y Web Chat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Chat / Mensaje</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-sm transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simular Mensaje</span>
          </button>
        </div>
      </div>

      {/* Main Inbox Interface */}
      <div className="bg-gray-950 border border-gray-800 rounded-2xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-14rem)]">
        {/* Left Column: Conversations List */}
        <div className="md:col-span-4 border-r border-gray-800 flex flex-col h-full bg-gray-950/60">
          {/* Channel Filter Pills */}
          <div className="p-3 border-b border-gray-800/80 flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'whatsapp', label: 'WhatsApp' },
              { id: 'instagram', label: 'Instagram' },
              { id: 'facebook', label: 'Facebook' },
              { id: 'email', label: 'Email' }
            ].map(ch => (
              <button
                key={ch.id}
                onClick={() => setChannelFilter(ch.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition ${
                  channelFilter === ch.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Conversations Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500 space-y-3">
                <MessageSquare className="w-8 h-8 text-indigo-400/30 mx-auto" />
                <p>No hay conversaciones activas en este canal.</p>
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold"
                >
                  + Iniciar Nueva Conversación
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = selectedConvId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`p-3.5 cursor-pointer transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-950/40 to-transparent border-l-2 border-indigo-500'
                        : 'hover:bg-gray-900/40'
                    }`}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {conv.contactName.charAt(0)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-gray-950 rounded-full p-0.5">
                        {getChannelIcon(conv.channel)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-white truncate">
                          {conv.contactName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {conv.lastMessageAt}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-400 truncate mb-1">
                        {conv.lastMessage}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-mono truncate">
                          {conv.channelIdentifier}
                        </span>

                        {conv.aiAutoPilot ? (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                            <Bot className="w-3 h-3" /> IA Activa
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Manual</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Thread & Composer */}
        <div className="md:col-span-8 flex flex-col h-full bg-gray-900/30">
          {activeConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-gray-800 bg-gray-950/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {activeConversation.contactName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">
                        {activeConversation.contactName}
                      </h3>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-900 border border-gray-800 text-[10px] font-medium text-gray-300">
                        {getChannelIcon(activeConversation.channel)}
                        <span className="capitalize">{activeConversation.channel}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {activeContact?.company ? `${activeContact.company} • ` : ''}
                      {activeConversation.channelIdentifier}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeConversation.channel === 'whatsapp' && (
                    <a
                      href={`https://wa.me/${activeConversation.channelIdentifier.replace(/\D/g, '') || '584123590065'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
                      title="Abrir conversación directamente en WhatsApp Web o en tu celular"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir en WhatsApp</span>
                    </a>
                  )}

                  {activeConversation.channel === 'instagram' && (
                    <a
                      href={`https://instagram.com/${activeConversation.channelIdentifier.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-semibold transition"
                      title="Ver en Instagram"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir Instagram</span>
                    </a>
                  )}

                  {/* AI Autopilot Switch Button */}
                  <button
                    onClick={handleToggleAutopilot}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      activeConversation.aiAutoPilot
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                    title="Activar o pausar respuesta autónoma de la IA 24/7 en esta conversación"
                  >
                    <Bot className={`w-4 h-4 ${activeConversation.aiAutoPilot ? 'text-emerald-400 animate-pulse' : 'text-gray-400'}`} />
                    <span>
                      IA 24/7: <strong className={activeConversation.aiAutoPilot ? 'text-emerald-400' : 'text-gray-400'}>{activeConversation.aiAutoPilot ? 'ON' : 'OFF'}</strong>
                    </span>
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {loadingMessages ? (
                  <div className="py-12 text-center text-xs text-gray-500">Cargando mensajes...</div>
                ) : (
                  messages.map(msg => {
                    const isContact = msg.sender === 'contact';
                    const isAI = msg.sender === 'ai';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isContact ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1 px-1">
                          {isAI && <Bot className="w-3 h-3 text-emerald-400" />}
                          <span className={isAI ? 'text-emerald-400 font-semibold' : ''}>
                            {msg.senderName}
                          </span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <div
                          className={`max-w-[78%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                            isContact
                              ? 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700/50'
                              : isAI
                              ? 'bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 text-indigo-100 rounded-tr-sm'
                              : 'bg-indigo-600 text-white rounded-tr-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-gray-800 bg-gray-950/90 space-y-2">
                {/* AI Assist button */}
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    disabled={draftingAI}
                    onClick={handleAiAssist}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>{draftingAI ? 'Generando respuesta con IA...' : 'Escribir con IA (Asistente Comercial)'}</span>
                  </button>

                  <span className="text-[10px] text-gray-500">
                    Enter para enviar respuesta manual
                  </span>
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={`Escribe una respuesta para ${activeConversation.contactName}...`}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-gray-500">
              Selecciona una conversación para ver los mensajes.
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsNewChatOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Iniciar Nueva Conversación Directa</h3>
                <p className="text-xs text-gray-400">Envía un mensaje real a un prospecto o número telefónico</p>
              </div>
            </div>

            <form onSubmit={handleStartNewChat} className="space-y-3.5 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Canal de Comunicación:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                    { id: 'instagram', label: 'Instagram', icon: Instagram },
                    { id: 'email', label: 'Email', icon: Mail }
                  ].map(ch => {
                    const Icon = ch.icon;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          setNewChatChannel(ch.id as any);
                          if (ch.id === 'whatsapp') setNewChatPhoneOrId('+58 412 359 0065');
                          else if (ch.id === 'instagram') setNewChatPhoneOrId('@gabrielemphoto');
                          else setNewChatPhoneOrId('cliente@ejemplo.com');
                        }}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold transition ${
                          newChatChannel === ch.id
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                            : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{ch.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Nombre del Contacto o Empresa:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Gabriel Morales"
                  value={newChatName}
                  onChange={e => setNewChatName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">
                  {newChatChannel === 'whatsapp'
                    ? 'Número de WhatsApp (con código de país, ej. +58 412...):'
                    : newChatChannel === 'instagram'
                    ? 'Usuario de Instagram (@usuario):'
                    : 'Correo Electrónico:'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={newChatChannel === 'whatsapp' ? '+58 412 359 0065' : newChatChannel === 'instagram' ? '@gabrielemphoto' : 'cliente@ejemplo.com'}
                  value={newChatPhoneOrId}
                  onChange={e => setNewChatPhoneOrId(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Primer Mensaje:</label>
                <textarea
                  rows={3}
                  value={newChatInitialText}
                  onChange={e => setNewChatInitialText(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewChatOpen(false)}
                  className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl border border-gray-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingChat || !newChatName.trim() || !newChatPhoneOrId.trim()}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  {creatingChat ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Iniciar Conversación</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
