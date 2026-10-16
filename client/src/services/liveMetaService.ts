/**
 * Live integration service for Meta WhatsApp Cloud API and Instagram Graph API.
 * Provides real verification, live message sending to WhatsApp, and QR/Click-to-Chat generators.
 */

export interface MetaVerifyResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  status: string;
  error?: string;
}

export const liveMetaService = {
  /**
   * Verifies a Meta WhatsApp Cloud API Phone Number ID & Token
   */
  async verifyWhatsAppConnection(phoneNumberId: string, accessToken: string): Promise<MetaVerifyResult> {
    const cleanId = (phoneNumberId || '').trim();
    const cleanToken = (accessToken || '').trim();

    if (!cleanId || !cleanToken) {
      return {
        success: false,
        message: 'Faltan el Phone Number ID o el Access Token de Meta.'
      };
    }

    try {
      // Query Meta Graph API for the phone number record
      const url = `https://graph.facebook.com/v21.0/${cleanId}?fields=verified_name,code_verification_status,display_phone_number,quality_rating`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${cleanToken}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data?.error?.message || `Error HTTP ${res.status} de Meta Graph API.`,
          details: data?.error
        };
      }

      return {
        success: true,
        message: `¡Conexión verificada con Meta WhatsApp! Número: ${data.display_phone_number || cleanId} (${data.verified_name || 'Nombre Verificado'}) - Calidad: ${data.quality_rating || 'GREEN'}`,
        details: data
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error al conectar con los servidores de Meta: ${err.message}`
      };
    }
  },

  /**
   * Sends a REAL WhatsApp message to a customer's phone using Meta Cloud API
   */
  async sendRealWhatsAppMessage(params: {
    phoneNumberId: string;
    accessToken: string;
    toPhone: string;
    messageText: string;
  }): Promise<WhatsAppSendResult> {
    const { phoneNumberId, accessToken, toPhone, messageText } = params;
    const cleanPhone = toPhone.replace(/\D/g, '');

    if (!cleanPhone) {
      return {
        success: false,
        status: 'error',
        error: 'El número de teléfono no es válido. Debe incluir el código de país (ej. +34..., +58..., +52..., +1...).'
      };
    }

    if (cleanPhone === '15551234567') {
      return {
        success: false,
        status: 'error',
        error: 'El número +1 (555) 123-4567 es un ejemplo de muestra. Por favor introduce tu número de WhatsApp real con código de país.'
      };
    }

    const cleanToken = (accessToken || '').trim();
    const cleanId = (phoneNumberId || '').trim();

    if (!cleanId || cleanId === '1098234729104') {
      return {
        success: false,
        status: 'config_missing',
        error: 'El Phone Number ID actual es un valor de ejemplo (1098234729104). Copia tu Phone Number ID real desde Meta Developers > WhatsApp > Getting Started.'
      };
    }

    if (!cleanToken || cleanToken.includes('...') || cleanToken.includes('MARGARITA') || cleanToken.includes('LUXORA') || cleanToken.length < 30) {
      return {
        success: false,
        status: 'config_missing',
        error: 'El Token actual es un texto de ejemplo ("EAAQ..."). Debes pegar tu Token real generado en developers.facebook.com (empieza por EAAB... o EAA... y tiene más de 150 caracteres).'
      };
    }

    try {
      const url = `https://graph.facebook.com/v21.0/${cleanId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cleanToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: messageText
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const metaError = data?.error;
        const rawMsg = metaError?.message || `Error HTTP ${res.status}`;
        const code = metaError?.code;

        let friendlyError = rawMsg;
        if (rawMsg.includes('Invalid JSON for postcard') || code === 190 || metaError?.type === 'OAuthException') {
          friendlyError = 'Error de Meta (Code 190): El Access Token es inválido, expiró o fue truncado. Ve a developers.facebook.com > WhatsApp > Primeros pasos y copia un token nuevo.';
        } else if (code === 131030 || code === 131000 || rawMsg.includes('not in allowed list')) {
          friendlyError = 'Número no autorizado en Sandbox (Code 131030): En la cuenta de prueba de Meta debes agregar tu número en el campo "Para (To)" en developers.facebook.com para autorizarlo.';
        } else if (code === 131047) {
          friendlyError = 'Ventana de 24 horas cerrada (Code 131047): Meta requiere que el cliente te haya enviado un mensaje primero en las últimas 24h o usar una plantilla verificada (Template).';
        }

        return {
          success: false,
          status: 'meta_error',
          error: friendlyError
        };
      }

      const messageId = data?.messages?.[0]?.id || `wamid-${Date.now()}`;
      return {
        success: true,
        messageId,
        status: 'delivered'
      };
    } catch (err: any) {
      return {
        success: false,
        status: 'network_error',
        error: `Fallo de red al enviar WhatsApp: ${err.message}`
      };
    }
  },

  /**
   * Verifies an Instagram Graph API Token and Page connection
   */
  async verifyInstagramConnection(pageId: string, accessToken: string): Promise<MetaVerifyResult> {
    const cleanToken = (accessToken || '').trim();
    if (!cleanToken) {
      return {
        success: false,
        message: 'Falta el User o Page Access Token de Meta Instagram.'
      };
    }

    try {
      const url = `https://graph.facebook.com/v21.0/me?fields=id,name,instagram_business_account{id,username,name,profile_picture_url}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${cleanToken}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data?.error?.message || `Error HTTP ${res.status} de Meta Graph API.`,
          details: data?.error
        };
      }

      const igAccount = data.instagram_business_account;
      return {
        success: true,
        message: igAccount?.username
          ? `¡Conexión verificada con Instagram Business (@${igAccount.username})!`
          : `¡Token de Meta válido para la página "${data.name}"!`,
        details: data
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Error al contactar con la API de Instagram: ${err.message}`
      };
    }
  },

  /**
   * Generates a Click-to-Chat direct WhatsApp link
   */
  generateWhatsAppClickToChat(phone: string, text: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
};
