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
  RefreshCw
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
            Conecta WhatsApp Cloud API, Instagram Direct, Facebook Messenger, Email Transaccional, Pagos y Apps externas.
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
          {/* WhatsApp Cloud API */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">WhatsApp Business Cloud API (Meta)</h3>
                  <p className="text-xs text-gray-400">Envío de mensajes oficiales, flujos interactivos y auto-respuestas IA</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectado y Listo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Identificador de Número de Teléfono (Phone Number ID)</label>
                <input
                  type="text"
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
                  value={formData.whatsapp.wabaId}
                  onChange={e => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, wabaId: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Token Permanente de Acceso (System User Access Token)</label>
                <input
                  type="password"
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
                  <span>URL de Devolución de Llamada para Webhook (Callback URL en Meta for Developers):</span>
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

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleSavePlatform('whatsapp', formData.whatsapp)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md"
              >
                Guardar Configuración WhatsApp
              </button>
            </div>
          </div>

          {/* Instagram Direct API */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Instagram Direct Messaging API</h3>
                  <p className="text-xs text-gray-400">Automatiza respuestas a DMs, menciones en Stories y comentarios</p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                Conectado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Instagram Business Account ID</label>
                <input
                  type="text"
                  value={formData.instagram.igUserId}
                  onChange={e => setFormData({
                    ...formData,
                    instagram: { ...formData.instagram, igUserId: e.target.value }
                  })}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1 font-semibold">Token de Acceso de Página de Meta</label>
                <input
                  type="password"
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
                  <span>URL del Webhook de Instagram:</span>
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md"
              >
                Guardar Configuración Instagram
              </button>
            </div>
          </div>

          {/* Email SMTP & Resend */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Servicio de Correo Electrónico (Resend / SMTP)</h3>
                  <p className="text-xs text-gray-400">Entregabilidad para notificaciones, workflows y newsletters</p>
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md"
              >
                Guardar Configuración Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Configuración de Pasarela Stripe</h3>
              <p className="text-xs text-gray-400">Procesamiento seguro de tarjetas de crédito y suscripciones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-gray-300 block mb-1 font-semibold">Clave Pública (Publishable Key)</label>
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
              <label className="text-gray-300 block mb-1 font-semibold">Clave Secreta (Secret Key)</label>
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md"
            >
              Guardar Credenciales de Stripe
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: EXTERNAL APPS */}
      {activeTab === 'external' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Shopify */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Shopify</h3>
            </div>
            <p className="text-xs text-gray-400">Sincroniza pedidos, carritos abandonados y nuevos clientes en el CRM.</p>
            <div className="text-xs">
              <label className="text-gray-400 block mb-1">Dominio de la Tienda</label>
              <input
                type="text"
                value={formData.shopify.shopDomain}
                onChange={e => setFormData({
                  ...formData,
                  shopify: { ...formData.shopify, shopDomain: e.target.value }
                })}
                className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-mono text-[11px]"
              />
            </div>
            <button
              onClick={() => handleSavePlatform('shopify', formData.shopify)}
              className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded"
            >
              Guardar Shopify
            </button>
          </div>

          {/* Airtable */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm text-white">Airtable</h3>
            </div>
            <p className="text-xs text-gray-400">Exporta leads e interacciones hacia bases de Airtable automáticamente.</p>
            <div className="text-xs">
              <label className="text-gray-400 block mb-1">Base ID</label>
              <input
                type="text"
                value={formData.airtable.baseId}
                onChange={e => setFormData({
                  ...formData,
                  airtable: { ...formData.airtable, baseId: e.target.value }
                })}
                className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-mono text-[11px]"
              />
            </div>
            <button
              onClick={() => handleSavePlatform('airtable', formData.airtable)}
              className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded"
            >
              Guardar Airtable
            </button>
          </div>

          {/* Asana */}
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-sm text-white">Asana</h3>
            </div>
            <p className="text-xs text-gray-400">Crea tareas operativas para tu equipo de entrega cuando se gana una venta.</p>
            <div className="text-xs">
              <label className="text-gray-400 block mb-1">Personal Access Token</label>
              <input
                type="password"
                placeholder="0/..."
                value={formData.asana.accessToken}
                onChange={e => setFormData({
                  ...formData,
                  asana: { ...formData.asana, accessToken: e.target.value }
                })}
                className="w-full bg-gray-950 border border-gray-800 rounded p-2 text-white font-mono text-[11px]"
              />
            </div>
            <button
              onClick={() => handleSavePlatform('asana', formData.asana)}
              className="w-full py-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold rounded"
            >
              Guardar Asana
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
