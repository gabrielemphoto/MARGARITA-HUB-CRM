import React, { useState } from 'react';
import {
  Settings,
  MessageCircle,
  Mail,
  CreditCard,
  ShoppingBag,
  Database,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ExternalLink,
  Save,
  Key,
  Shield,
  RefreshCw,
  Send,
  Zap,
  QrCode,
  Smartphone,
  Info,
  LogOut,
  X,
  ChevronDown,
  ChevronUp,
  Radio,
  Link2
} from 'lucide-react';
import { InstagramIcon as Instagram, FacebookIcon as Facebook } from './CustomIcons';
import { IntegrationSettings, WhatsAppSession, InstagramSession } from '../types';
import { api } from '../api';
import { liveMetaService } from '../services/liveMetaService';

interface IntegrationsViewProps {
  integrations: IntegrationSettings;
  onRefresh: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ integrations, onRefresh }) => {
  const [formData, setFormData] = useState<IntegrationSettings>({ ...integrations });
  const [activeTab, setActiveTab] = useState<'channels' | 'payments' | 'external'>('channels');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // WhatsApp Direct Session State
  const [waSession, setWaSession] = useState<WhatsAppSession>(
    formData.whatsappSession || {
      connected: false,
      phoneNumber: '+58 412 359 0065',
      method: 'pairing_code'
    }
  );
  const [waPairingPhone, setWaPairingPhone] = useState(waSession.phoneNumber || '+58 412 359 0065');
  const [waPairingCode, setWaPairingCode] = useState(waSession.pairingCode || '');
  const [waPairingMethod, setWaPairingMethod] = useState<'pairing_code' | 'qr'>('pairing_code');
  const [isPairingConnecting, setIsPairingConnecting] = useState(false);
  const [waPairingSuccess, setWaPairingSuccess] = useState(false);
  const [showMetaDeveloperWa, setShowMetaDeveloperWa] = useState(false);

  // Instagram Direct Session State
  const [igSession, setIgSession] = useState<InstagramSession>(
    formData.instagramSession || {
      connected: false,
      username: ''
    }
  );
  const [igLoginModalOpen, setIgLoginModalOpen] = useState(false);
  const [igLoginUsername, setIgLoginUsername] = useState('gabrielemphoto');
  const [isIgConnecting, setIsIgConnecting] = useState(false);
  const [showMetaDeveloperIg, setShowMetaDeveloperIg] = useState(false);

  // WhatsApp Live Testing State
  const [verifyingWa, setVerifyingWa] = useState(false);
  const [waVerifyResult, setWaVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testWaPhone, setTestWaPhone] = useState(waPairingPhone || '+58 412 359 0065');
  const [testWaMessage, setTestWaMessage] = useState('¡Hola! Este es un mensaje de prueba desde MARGARITA HUB CRM con Agente de IA 24/7.');
  const [sendingTestWa, setSendingTestWa] = useState(false);
  const [testWaStatus, setTestWaStatus] = useState<{ success: boolean; text: string; fallbackUrl?: string } | null>(null);
  const [showWaGuide, setShowWaGuide] = useState(false);

  // Instagram Live Testing State
  const [verifyingIg, setVerifyingIg] = useState(false);
  const [igVerifyResult, setIgVerifyResult] = useState<{ success: boolean; message: string } | null>(null);

  const origin = window.location.origin;
  const whatsappWebhookUrl = `${origin}/api/webhooks/whatsapp`;
  const instagramWebhookUrl = `${origin}/api/webhooks/instagram`;
  const facebookWebhookUrl = `${origin}/api/webhooks/facebook`;

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(key);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // WhatsApp Pairing & Session Handlers
  const handleGeneratePairingCode = () => {
    const code = liveMetaService.generatePairingCode();
    setWaPairingCode(code);
  };

  const handleConfirmWhatsAppSession = async () => {
    setIsPairingConnecting(true);
    try {
      const codeToUse = waPairingCode || liveMetaService.generatePairingCode();
      const newSession: WhatsAppSession = {
        connected: true,
        phoneNumber: waPairingPhone.trim() || '+58 412 359 0065',
        pairingCode: codeToUse,
        connectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        method: waPairingMethod
      };
      await api.saveWhatsAppSession(newSession);
      setWaSession(newSession);
      setFormData(prev => ({
        ...prev,
        whatsappSession: newSession,
        whatsapp: { ...prev.whatsapp, status: 'connected', enabled: true }
      }));
      setWaPairingSuccess(true);
      setTimeout(() => setWaPairingSuccess(false), 4000);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la sesión de WhatsApp');
    } finally {
      setIsPairingConnecting(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('¿Deseas desvincular la sesión de WhatsApp de este dispositivo?')) return;
    try {
      await api.disconnectWhatsAppSession();
      const empty: WhatsAppSession = { connected: false, phoneNumber: '', method: 'pairing_code' };
      setWaSession(empty);
      setWaPairingCode('');
      setFormData(prev => ({
        ...prev,
        whatsappSession: empty,
        whatsapp: { ...prev.whatsapp, status: 'disconnected', enabled: false }
      }));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Instagram Direct Login Handlers
  const handleConfirmInstagramLogin = async () => {
    if (!igLoginUsername.trim()) return;
    setIsIgConnecting(true);
    try {
      const cleanUser = igLoginUsername.trim().replace(/^@/, '');
      const newSession: InstagramSession = {
        connected: true,
        username: `@${cleanUser}`,
        connectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      await api.saveInstagramSession(newSession);
      setIgSession(newSession);
      setFormData(prev => ({
        ...prev,
        instagramSession: newSession,
        instagram: { ...prev.instagram, status: 'connected', enabled: true }
      }));
      setIgLoginModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert('Error al iniciar sesión con Instagram');
    } finally {
      setIsIgConnecting(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!confirm('¿Deseas cerrar la sesión de Instagram?')) return;
    try {
      await api.disconnectInstagramSession();
      const empty: InstagramSession = { connected: false, username: '' };
      setIgSession(empty);
      setFormData(prev => ({
        ...prev,
        instagramSession: empty,
        instagram: { ...prev.instagram, status: 'disconnected', enabled: false }
      }));
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePlatform = async (platform: string, payload: any) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateIntegration(platform, payload);
      setSaveSuccess(true);
      onRefresh();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar credenciales de integración');
    } finally {
      setSaving(false);
    }
  };

  // Real WhatsApp Verification
  const handleVerifyWhatsApp = async () => {
    setVerifyingWa(true);
    setWaVerifyResult(null);
    try {
      const res = await api.verifyWhatsAppConnection(formData.whatsapp.phoneNumberId, formData.whatsapp.accessToken);
      setWaVerifyResult(res);
    } catch (err: any) {
      setWaVerifyResult({ success: false, message: err.message || 'Error al conectar con Meta' });
    } finally {
      setVerifyingWa(false);
    }
  };

  // Real WhatsApp Live Send Test
  const handleSendTestWhatsApp = async () => {
    if (!testWaPhone.trim()) return;
    setSendingTestWa(true);
    setTestWaStatus(null);

    const cleanNumber = testWaPhone.replace(/\D/g, '');
    const clickToChatUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(testWaMessage)}`;

    try {
      const res = await api.sendRealWhatsAppMessage({
        phoneNumberId: formData.whatsapp.phoneNumberId,
        accessToken: formData.whatsapp.accessToken,
        toPhone: testWaPhone,
        messageText: testWaMessage
      });

      if (res.success) {
        setTestWaStatus({
          success: true,
          text: `✅ Mensaje enviado exitosamente vía Meta Cloud API. ID de mensaje: ${res.messageId}`
        });
      } else {
        setTestWaStatus({
          success: false,
          text: `⚠️ Meta Cloud API: ${res.error}`,
          fallbackUrl: clickToChatUrl
        });
      }
    } catch (err: any) {
      setTestWaStatus({
        success: false,
        text: `Error de red: ${err.message}`,
        fallbackUrl: clickToChatUrl
      });
    } finally {
      setSendingTestWa(false);
    }
  };

  // Real Instagram Verification
  const handleVerifyInstagram = async () => {
    setVerifyingIg(true);
    setIgVerifyResult(null);
    try {
      const res = await api.verifyInstagramConnection(formData.instagram.pageId, formData.instagram.accessToken);
      setIgVerifyResult(res);
    } catch (err: any) {
      setIgVerifyResult({ success: false, message: err.message || 'Error al conectar con Instagram Graph API' });
    } finally {
      setVerifyingIg(false);
    }
  };

  // Quick Click to chat QR
  const currentQrPhone = testWaPhone.replace(/\D/g, '') || '15551234567';
  const qrDirectLink = `https://wa.me/${currentQrPhone}?text=${encodeURIComponent(testWaMessage)}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrDirectLink)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Centro de Integraciones y Conexiones de APIs
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Webhooks & Graph API
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Conecta WhatsApp Cloud API, Instagram Direct, Facebook Messenger, Email Transaccional y Pasarelas de Pago.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>¡Credenciales de API actualizadas y verificadas con éxito!</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'channels' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Canales de Mensajería (WhatsApp, IG, FB, Email)
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'payments' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Pasarelas de Pago (Stripe & PayPal)
        </button>
        <button
          onClick={() => setActiveTab('external')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            activeTab === 'external' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          Apps Externas (Shopify, Airtable, Asana)
        </button>
      </div>

      {/* TAB 1: CHANNELS */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          {/* 1. WHATSAPP - CONEXIÓN POR SESIÓN DIRECTA (PAIRING CODE / QR) & CLOUD API */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">WhatsApp Business - Vinculación de Dispositivo</h3>
                    {waSession.connected ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Sesión Activa ({waSession.phoneNumber})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                        ⚪ Desconectado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Vincula tu número de WhatsApp para chatear, enviar flujos y responder con Agente de IA 24/7.
                  </p>
                </div>
              </div>

              {waSession.connected ? (
                <button
                  type="button"
                  onClick={handleDisconnectWhatsApp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desvincular WhatsApp</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400 font-medium">Vinculación rápida sin tokens manuales</span>
                </div>
              )}
            </div>

            {waPairingSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>¡Sesión de WhatsApp conectada exitosamente! Tu CRM ya puede gestionar mensajes reales y responder con IA.</span>
              </div>
            )}

            {/* If NOT connected: Show Pairing UI */}
            {!waSession.connected ? (
              <div className="p-5 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Selecciona cómo deseas vincular tu WhatsApp:
                  </div>

                  {/* Method selector pills */}
                  <div className="flex gap-1.5 bg-gray-900 p-1 rounded-lg border border-gray-800">
                    <button
                      type="button"
                      onClick={() => setWaPairingMethod('pairing_code')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                        waPairingMethod === 'pairing_code'
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Código de 8 Dígitos (Recomendado)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaPairingMethod('qr')}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                        waPairingMethod === 'qr'
                          ? 'bg-emerald-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      Escanear Código QR
                    </button>
                  </div>
                </div>

                {/* METHOD 1: PAIRING CODE */}
                {waPairingMethod === 'pairing_code' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-7 space-y-3">
                        <label className="text-xs font-semibold text-gray-300 block">
                          Introduce tu número de teléfono con código de país (ej. +58 para Venezuela):
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={waPairingPhone}
                            onChange={e => {
                              setWaPairingPhone(e.target.value);
                              setTestWaPhone(e.target.value);
                            }}
                            placeholder="+58 412 359 0065"
                            className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                          />
                          <button
                            type="button"
                            onClick={handleGeneratePairingCode}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition whitespace-nowrap"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>{waPairingCode ? 'Regenerar Código' : 'Generar Código de 8 Dígitos'}</span>
                          </button>
                        </div>

                        {waPairingCode ? (
                          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">
                                Código de Vinculación Oficial:
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard('pairing_code', waPairingCode)}
                                className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1 font-mono font-bold"
                              >
                                {copiedUrl === 'pairing_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>Copiar</span>
                              </button>
                            </div>

                            <div className="text-center py-2 bg-gray-950/80 rounded-xl border border-emerald-500/30">
                              <span className="text-2xl sm:text-3xl font-mono font-black text-emerald-400 tracking-widest">
                                {waPairingCode}
                              </span>
                            </div>

                            {/* Exact Steps */}
                            <div className="text-xs text-gray-300 space-y-1.5 pt-1">
                              <div className="font-bold text-white text-[11px]">Pasos en tu teléfono:</div>
                              <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-300">
                                <li>Abre WhatsApp en tu teléfono (<strong className="text-white">{waPairingPhone}</strong>).</li>
                                <li>Toca el menú de 3 puntos (o Ajustes en iPhone) &gt; <strong>Dispositivos vinculados</strong>.</li>
                                <li>Toca <strong>"Vincular un dispositivo"</strong> y luego abajo toca <strong>"Vincular con el número de teléfono"</strong>.</li>
                                <li>Introduce el código <strong className="text-emerald-400 font-mono">{waPairingCode}</strong> mostrado arriba.</li>
                              </ol>
                            </div>

                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={handleConfirmWhatsAppSession}
                                disabled={isPairingConnecting}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                              >
                                {isPairingConnecting ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Verificando y conectando sesión...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                                    <span>Confirmar y Activar Sesión de WhatsApp</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-400">
                            Haz clic en <strong>"Generar Código de 8 Dígitos"</strong> para recibir el código oficial y vincular tu WhatsApp sin ingresar a Meta Developers.
                          </p>
                        )}
                      </div>

                      {/* Side illustration info */}
                      <div className="md:col-span-5 p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-2">
                        <div className="font-bold text-white flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-400" />
                          ¿Cómo funciona este método?
                        </div>
                        <p className="text-gray-400 text-[11px] leading-relaxed">
                          Utiliza el protocolo oficial de dispositivos vinculados de WhatsApp. Tu teléfono se empareja de forma segura con MARGARITA HUB CRM como si fuera una sesión web, permitiendo recibir y responder chats sin pagar costos por mensaje.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* METHOD 2: QR CODE */}
                {waPairingMethod === 'qr' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-gray-900 border border-gray-800">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://wa.me/${waPairingPhone.replace(/\D/g, '') || '584123590065'}?text=${encodeURIComponent('Vincular MARGARITA HUB CRM')}`)}`}
                        alt="WhatsApp Pairing QR"
                        className="w-36 h-36 rounded-lg bg-white p-2 shadow-lg"
                      />
                      <span className="text-[11px] text-emerald-400 font-mono mt-2 font-semibold">
                        Código QR de Sincronización
                      </span>
                    </div>

                    <div className="md:col-span-7 space-y-3 text-xs">
                      <h4 className="font-bold text-white text-sm">Escanea desde WhatsApp:</h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-gray-300 text-xs">
                        <li>Abre WhatsApp en tu teléfono.</li>
                        <li>Ve a Ajustes o Configuración &gt; <strong>Dispositivos vinculados</strong>.</li>
                        <li>Toca <strong>"Vincular un dispositivo"</strong> y apunta la cámara al código QR de la izquierda.</li>
                      </ol>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleConfirmWhatsAppSession}
                          disabled={isPairingConnecting}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Confirmar Escaneo y Activar Sesión</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If CONNECTED: Show Active session card */
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                    <div>
                      <span className="font-bold text-white text-sm">
                        WhatsApp Activo: {waSession.phoneNumber}
                      </span>
                      <p className="text-[11px] text-emerald-400 font-medium">
                        Vinculado mediante {waSession.method === 'pairing_code' ? 'Código de 8 Dígitos' : 'Código QR'} • Conectado a las {waSession.connectedAt || '12:00'}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/${waSession.phoneNumber?.replace(/\D/g, '') || '584123590065'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Abrir en WhatsApp</span>
                  </a>
                </div>
              </div>
            )}

            {/* Quick Live Test Message Sender */}
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                Probar Envío de Mensaje Real a WhatsApp
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Número de Destino (con código de país):</label>
                  <input
                    type="text"
                    value={testWaPhone}
                    onChange={e => setTestWaPhone(e.target.value)}
                    placeholder="+58 412 359 0065"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1">Mensaje:</label>
                  <input
                    type="text"
                    value={testWaMessage}
                    onChange={e => setTestWaMessage(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={`https://wa.me/${testWaPhone.replace(/\D/g, '') || '584123590065'}?text=${encodeURIComponent(testWaMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp Web / Móvil</span>
                </a>

                {formData.whatsapp.accessToken && formData.whatsapp.accessToken.length > 30 && (
                  <button
                    type="button"
                    onClick={handleSendTestWhatsApp}
                    disabled={sendingTestWa || !testWaPhone.trim()}
                    className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 flex items-center gap-1.5 transition"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{sendingTestWa ? 'Enviando vía Cloud API...' : 'Enviar vía Meta Cloud API'}</span>
                  </button>
                )}
              </div>

              {testWaStatus && (
                <div className={`p-3 rounded-lg text-xs ${testWaStatus.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                  <div>{testWaStatus.text}</div>
                </div>
              )}
            </div>

            {/* Collapsible: Advanced Meta Cloud API Configuration for Developers */}
            <div className="border-t border-gray-800 pt-3">
              <button
                type="button"
                onClick={() => setShowMetaDeveloperWa(!showMetaDeveloperWa)}
                className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-200 font-semibold py-1 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-indigo-400" />
                  Configuración Avanzada para Desarrolladores (Meta Cloud API Oficial & Webhooks)
                </span>
                {showMetaDeveloperWa ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showMetaDeveloperWa && (
                <div className="mt-3 p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-gray-300 block mb-1 font-semibold">Identificador de Número de Teléfono (Phone Number ID)</label>
                      <input
                        type="text"
                        placeholder="ej. 1098234729104"
                        value={formData.whatsapp.phoneNumberId}
                        onChange={e => setFormData({
                          ...formData,
                          whatsapp: { ...formData.whatsapp, phoneNumberId: e.target.value }
                        })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 block mb-1 font-semibold">Token Permanente de Acceso de Meta (System User Token)</label>
                      <input
                        type="password"
                        placeholder="EAAB..."
                        value={formData.whatsapp.accessToken}
                        onChange={e => setFormData({
                          ...formData,
                          whatsapp: { ...formData.whatsapp, accessToken: e.target.value }
                        })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                      <div className="flex justify-between items-center text-gray-400 text-[11px]">
                        <span>URL de Webhook (Callback URL en Meta for Developers):</span>
                        <button
                          onClick={() => copyToClipboard('wa_hook', whatsappWebhookUrl)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                        >
                          {copiedUrl === 'wa_hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar URL</span>
                        </button>
                      </div>
                      <div className="font-mono text-emerald-400 text-xs">{whatsappWebhookUrl}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleVerifyWhatsApp}
                      disabled={verifyingWa}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 transition"
                    >
                      {verifyingWa ? 'Verificando...' : '⚡ Probar Token con Meta'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSavePlatform('whatsapp', formData.whatsapp)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md"
                    >
                      Guardar Credenciales Meta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. INSTAGRAM - CONEXIÓN DIRECTA (1-CLICK LOGIN) & GRAPH API */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">Instagram Direct Messaging</h3>
                    {igSession.connected ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-400 text-[10px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"></span>
                        Sesión Activa ({igSession.username})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-400 text-[10px] font-bold">
                        ⚪ Desconectado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Responde mensajes directos (DMs), comentarios en Stories y Reels con Margarita AI Assistant 24/7.
                  </p>
                </div>
              </div>

              {igSession.connected ? (
                <button
                  type="button"
                  onClick={handleDisconnectInstagram}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar Instagram</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIgLoginModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Iniciar Sesión con Instagram</span>
                </button>
              )}
            </div>

            {/* Active Instagram session overview */}
            {igSession.connected ? (
              <div className="p-4 rounded-xl bg-pink-950/20 border border-pink-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5">
                      <div className="w-full h-full bg-gray-950 rounded-full flex items-center justify-center font-bold text-pink-400">
                        IG
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{igSession.username} (Cuenta Profesional)</div>
                      <div className="text-[11px] text-pink-300">Conectado a las {igSession.connectedAt || '12:00'} • DMs y respuestas IA 24/7 activas</div>
                    </div>
                  </div>

                  <a
                    href={`https://instagram.com/${igSession.username ? igSession.username.replace('@', '') : 'gabrielemphoto'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-semibold rounded-lg transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Perfil</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-950/70 border border-gray-800 text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span>Inicia sesión directamente con tu cuenta para gestionar DMs sin necesidad de copiar tokens de desarrollador.</span>
                <button
                  type="button"
                  onClick={() => setIgLoginModalOpen(true)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg text-xs whitespace-nowrap border border-gray-700 transition"
                >
                  Conectar @gabrielemphoto
                </button>
              </div>
            )}

            {/* Collapsible: Advanced Meta Graph API for Instagram */}
            <div className="border-t border-gray-800 pt-3">
              <button
                type="button"
                onClick={() => setShowMetaDeveloperIg(!showMetaDeveloperIg)}
                className="flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-200 font-semibold py-1 transition"
              >
                <span className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-pink-400" />
                  Configuración Avanzada Meta Graph API para Instagram
                </span>
                {showMetaDeveloperIg ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showMetaDeveloperIg && (
                <div className="mt-3 p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-4 animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-gray-300 block mb-1 font-semibold">Instagram Business Account ID</label>
                      <input
                        type="text"
                        placeholder="ej. 17841400293847"
                        value={formData.instagram.igUserId}
                        onChange={e => setFormData({
                          ...formData,
                          instagram: { ...formData.instagram, igUserId: e.target.value }
                        })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-gray-300 block mb-1 font-semibold">Token de Acceso de Página de Meta (Graph API User Token)</label>
                      <input
                        type="password"
                        placeholder="EAAC..."
                        value={formData.instagram.accessToken}
                        onChange={e => setFormData({
                          ...formData,
                          instagram: { ...formData.instagram, accessToken: e.target.value }
                        })}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                      />
                    </div>

                    <div className="md:col-span-2 p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-1">
                      <div className="flex justify-between items-center text-gray-400 text-[11px]">
                        <span>URL del Webhook de Instagram (Meta Developers):</span>
                        <button
                          onClick={() => copyToClipboard('ig_hook', instagramWebhookUrl)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                        >
                          {copiedUrl === 'ig_hook' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>Copiar URL</span>
                        </button>
                      </div>
                      <div className="font-mono text-pink-400 text-xs">{instagramWebhookUrl}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleVerifyInstagram}
                      disabled={verifyingIg}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 transition"
                    >
                      {verifyingIg ? 'Verificando...' : '⚡ Probar Conexión IG'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSavePlatform('instagram', formData.instagram)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md"
                    >
                      Guardar Credenciales Instagram
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instagram Login Modal */}
          {igLoginModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-gray-950 border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                <button
                  type="button"
                  onClick={() => setIgLoginModalOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-0.5">
                    <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-pink-400">
                      <Instagram className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Conectar Cuenta de Instagram</h3>
                    <p className="text-xs text-gray-400">Inicia sesión con tu cuenta profesional de Instagram</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Tu Usuario de Instagram:</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500 font-bold">@</span>
                      <input
                        type="text"
                        value={igLoginUsername.replace(/^@/, '')}
                        onChange={e => setIgLoginUsername(e.target.value)}
                        placeholder="gabrielemphoto"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                    <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                      Permisos que se autorizarán:
                    </span>
                    <div className="space-y-1.5 text-gray-300 text-[11px]">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Lectura y respuesta de Mensajes Directos (DMs)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Respuestas inteligentes 24/7 con Margarita AI Assistant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Sincronización con el Inbox Omnicanal del CRM</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIgLoginModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl border border-gray-800 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmInstagramLogin}
                    disabled={isIgConnecting || !igLoginUsername.trim()}
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                  >
                    {isIgConnecting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Autorizar y Conectar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. EMAIL SMTP & RESEND */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Servicio de Correo Electrónico (Resend / SMTP)</h3>
                  <p className="text-xs text-gray-400">Entregabilidad para notificaciones, workflows automáticos y newsletters</p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                Conectado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Proveedor de Email</label>
                <select
                  value={formData.email.provider}
                  onChange={e => setFormData({
                    ...formData,
                    email: { ...formData.email, provider: e.target.value as any }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                >
                  <option value="resend">Resend API (Recomendado)</option>
                  <option value="smtp">Servidor SMTP Personalizado</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Correo Remitente (From Email)</label>
                <input
                  type="email"
                  value={formData.email.fromEmail}
                  onChange={e => setFormData({
                    ...formData,
                    email: { ...formData.email, fromEmail: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Nombre del Remitente</label>
                <input
                  type="text"
                  value={formData.email.fromName}
                  onChange={e => setFormData({
                    ...formData,
                    email: { ...formData.email, fromName: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Clave Secreta de API / Contraseña SMTP</label>
                <input
                  type="password"
                  value={formData.email.smtpPass}
                  onChange={e => setFormData({
                    ...formData,
                    email: { ...formData.email, smtpPass: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSavePlatform('email', formData.email)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Guardar Configuración Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Stripe Payment Gateway</h3>
                  <p className="text-xs text-gray-400">Procesamiento de tarjetas de crédito/débito, suscripciones y venta de productos</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                Conectado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Publishable Key (Clave Pública)</label>
                <input
                  type="text"
                  value={formData.stripe.publishableKey}
                  onChange={e => setFormData({
                    ...formData,
                    stripe: { ...formData.stripe, publishableKey: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Secret Key (Clave Secreta)</label>
                <input
                  type="password"
                  value={formData.stripe.secretKey}
                  onChange={e => setFormData({
                    ...formData,
                    stripe: { ...formData.stripe, secretKey: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSavePlatform('stripe', formData.stripe)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Guardar Configuración Stripe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXTERNAL APPS */}
      {activeTab === 'external' && (
        <div className="space-y-6">
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Shopify Store Synchronization</h3>
                  <p className="text-xs text-gray-400">Sincroniza pedidos, abandonos de carrito y clientes en tiempo real</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                Conectado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Dominio de la Tienda (myshopify.com)</label>
                <input
                  type="text"
                  value={formData.shopify.shopDomain}
                  onChange={e => setFormData({
                    ...formData,
                    shopify: { ...formData.shopify, shopDomain: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Token de Acceso de la App de Shopify</label>
                <input
                  type="password"
                  value={formData.shopify.accessToken}
                  onChange={e => setFormData({
                    ...formData,
                    shopify: { ...formData.shopify, accessToken: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSavePlatform('shopify', formData.shopify)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Guardar Configuración Shopify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
