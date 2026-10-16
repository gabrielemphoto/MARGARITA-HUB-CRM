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
        error: 'El número de teléfono de destino no es válido. Debe incluir el código de país (ej. +1, +34, +58, +52).'
      };
    }

    if (!phoneNumberId || !accessToken || accessToken.length < 15) {
      return {
        success: false,
        status: 'config_missing',
        error: 'No se ha configurado el Phone Number ID o el Access Token de Meta en Integraciones.'
      };
    }

    try {
      const url = `https://graph.facebook.com/v21.0/${phoneNumberId.trim()}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.trim()}`,
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
        return {
          success: false,
          status: 'meta_error',
          error: data?.error?.message || `Error ${res.status} al enviar por Meta Cloud API.`
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
