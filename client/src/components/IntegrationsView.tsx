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
  Info
} from 'lucide-react';
import { InstagramIcon as Instagram, FacebookIcon as Facebook } from './CustomIcons';
import { IntegrationSettings } from '../types';
import { api } from '../api';

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

  // WhatsApp Live Testing State
  const [verifyingWa, setVerifyingWa] = useState(false);
  const [waVerifyResult, setWaVerifyResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testWaPhone, setTestWaPhone] = useState('+1 (555) 123-4567');
  const [testWaMessage, setTestWaMessage] = useState('¡Hola! Este es un mensaje de prueba desde MARGARITA HUB CRM con Agente de IA 24/7.');
  const [sendingTestWa, setSendingTestWa] = useState(false);
  const [testWaStatus, setTestWaStatus] = useState<{ success: boolean; text: string; fallbackUrl?: string } | null>(null);

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
          {/* 1. WHATSAPP CLOUD API */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">WhatsApp Business Cloud API (Meta Oficial)</h3>
                  <p className="text-xs text-gray-400">Envío de mensajes oficiales, flujos interactivos y auto-respuestas IA 24/7</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleVerifyWhatsApp}
                  disabled={verifyingWa}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{verifyingWa ? 'Verificando con Meta...' : '⚡ Probar Conexión'}</span>
                </button>
              </div>
            </div>

            {waVerifyResult && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                waVerifyResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {waVerifyResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                <span>{waVerifyResult.message}</span>
              </div>
            )}

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
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">WhatsApp Business Account ID (WABA ID)</label>
                <input
                  type="text"
                  placeholder="ej. 3948271049281"
                  value={formData.whatsapp.wabaId}
                  onChange={e => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, wabaId: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Token Permanente de Acceso de Meta (System User Token)</label>
                <input
                  type="password"
                  placeholder="EAA..."
                  value={formData.whatsapp.accessToken}
                  onChange={e => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, accessToken: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Token de Verificación del Webhook (Verify Token)</label>
                <input
                  type="text"
                  value={formData.whatsapp.verifyToken}
                  onChange={e => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, verifyToken: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="md:col-span-2 p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
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

            {/* Test WhatsApp Live Sender & QR Code */}
            <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Probar Envío Real a mi WhatsApp o Generar Enlace Directo
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-gray-400 block mb-1">Tu Número (con código país, ej: +34 612..., +58 412...)</label>
                      <input
                        type="text"
                        value={testWaPhone}
                        onChange={e => setTestWaPhone(e.target.value)}
                        placeholder="+34 612 345 678"
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Mensaje de Prueba</label>
                      <input
                        type="text"
                        value={testWaMessage}
                        onChange={e => setTestWaMessage(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSendTestWhatsApp}
                      disabled={sendingTestWa}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingTestWa ? 'Enviando por Meta API...' : 'Enviar Mensaje Real'}</span>
                    </button>

                    <a
                      href={qrDirectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-lg border border-gray-700 flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Abrir en WhatsApp Web / Móvil</span>
                    </a>
                  </div>

                  {testWaStatus && (
                    <div className={`p-3 rounded-lg text-xs ${testWaStatus.success ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'}`}>
                      <div>{testWaStatus.text}</div>
                      {testWaStatus.fallbackUrl && (
                        <div className="mt-2">
                          <a
                            href={testWaStatus.fallbackUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            👉 Haz clic aquí para enviar directamente por WhatsApp Web / App
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* QR Code preview */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-gray-900 border border-gray-800">
                  <img
                    src={qrImageSrc}
                    alt="WhatsApp QR Code"
                    className="w-28 h-28 rounded-lg bg-white p-1.5 shadow"
                  />
                  <span className="text-[10px] text-gray-400 mt-2 text-center">
                    Escanea para iniciar chat directo desde tu celular
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSavePlatform('whatsapp', formData.whatsapp)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Guardar Configuración WhatsApp
              </button>
            </div>
          </div>

          {/* 2. INSTAGRAM DIRECT MESSAGING API */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Instagram Direct Messaging API (Meta)</h3>
                  <p className="text-xs text-gray-400">Automatiza respuestas a DMs, menciones en Stories y comentarios con IA</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyInstagram}
                disabled={verifyingIg}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/30 text-xs font-semibold transition"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{verifyingIg ? 'Verificando...' : '⚡ Probar Conexión IG'}</span>
              </button>
            </div>

            {igVerifyResult && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                igVerifyResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}>
                {igVerifyResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                <span>{igVerifyResult.message}</span>
              </div>
            )}

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
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Facebook Page ID vinculada a Instagram</label>
                <input
                  type="text"
                  placeholder="ej. 1029384756"
                  value={formData.instagram.pageId}
                  onChange={e => setFormData({
                    ...formData,
                    instagram: { ...formData.instagram, pageId: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-300 block mb-1 font-semibold">Token de Acceso de Página de Meta (Graph API User Token)</label>
                <input
                  type="password"
                  placeholder="EAAC..."
                  value={formData.instagram.accessToken}
                  onChange={e => setFormData({
                    ...formData,
                    instagram: { ...formData.instagram, accessToken: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="md:col-span-2 p-3 rounded-xl bg-gray-950 border border-gray-800 space-y-1">
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

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSavePlatform('instagram', formData.instagram)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Guardar Configuración Instagram
              </button>
            </div>
          </div>

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
