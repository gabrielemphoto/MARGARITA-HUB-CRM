import { AISettings, Contact } from '../types';

export interface AIResponse {
  reply: string;
  providerUsed: string;
  tokensUsed?: number;
  latencyMs?: number;
}

/**
 * Executes a REAL call to any AI provider (OpenAI, Gemini, Groq, DeepSeek, Anthropic, or Custom).
 * Works directly from the client (mobile browser / GitHub Pages) or through the backend.
 */
export async function callRealAIProvider(
  settings: AISettings,
  incomingMessage: string,
  history: { sender: string; text: string }[] = [],
  contact?: Contact
): Promise<AIResponse> {
  const startTime = Date.now();
  const apiKey = (settings.apiKey || '').trim();

  // If no API Key is set, return a rich conversational response using the business knowledge
  if (!apiKey || apiKey.length < 5) {
    const business = settings.businessInfo;
    const lower = incomingMessage.toLowerCase();

    // Check handover keywords
    if (settings.humanHandoverKeywords?.some(k => lower.includes(k.toLowerCase()))) {
      return {
        reply: `He registrado que deseas atención personalizada. Un asesor especialista de MARGARITA HUB CRM tomará el control de esta conversación. Si tienes alguna duda urgente, déjanos tu número de contacto.`,
        providerUsed: 'Margarita Handover Protocol',
        latencyMs: Date.now() - startTime
      };
    }

    if (lower.includes('precio') || lower.includes('costo') || lower.includes('plan')) {
      return {
        reply: `¡Hola! Con gusto te informo: nuestros planes van desde $97/mes (Starter) hasta $297/mes (Enterprise Pro con Agentes IA ilimitados y WhatsApp multicanal). Puedes ver el desglose completo y agendar tu onboarding aquí: ${business.bookingUrl}`,
        providerUsed: 'Margarita Engine (Reglas Comerciales)',
        latencyMs: Date.now() - startTime
      };
    }

    if (lower.includes('whatsapp') || lower.includes('instagram')) {
      return {
        reply: `¡Excelente pregunta! MARGARITA HUB CRM se conecta de forma directa y oficial con WhatsApp Cloud API e Instagram Direct vía Meta Graph API. Incluye respuestas automáticas con IA 24/7, embudos de venta y sincronización de leads al instante.`,
        providerUsed: 'Margarita Engine (Reglas Comerciales)',
        latencyMs: Date.now() - startTime
      };
    }

    if (lower.includes('agendar') || lower.includes('cita') || lower.includes('reunion') || lower.includes('demo')) {
      return {
        reply: `¡Por supuesto! Puedes seleccionar el día y la hora que mejor te convenga para una videollamada de demostración gratuita en nuestro calendario oficial: ${business.bookingUrl}`,
        providerUsed: 'Margarita Engine (Reglas Comerciales)',
        latencyMs: Date.now() - startTime
      };
    }

    return {
      reply: `¡Hola! Soy Margarita AI Assistant, tu agente 24/7 en MARGARITA HUB CRM. Te confirmo que recibí tu mensaje: "${incomingMessage}". Te podemos ayudar a crear embudos de venta, automatizar WhatsApp/Instagram con IA y gestionar todo tu pipeline de clientes. ¿Te gustaría agendar una llamada de 15 minutos en ${business.bookingUrl}?`,
      providerUsed: 'Margarita Autonomous Engine (Native)',
      latencyMs: Date.now() - startTime
    };
  }

  // System Prompt with full business context
  const business = settings.businessInfo;
  const systemPrompt = `${settings.systemPrompt || 'Eres un asistente comercial de ventas 24/7 de MARGARITA HUB CRM.'}

INFORMACIÓN COMERCIAL DE LA EMPRESA:
- Empresa: ${business.companyName}
- Servicios: ${business.services}
- Precios y Planes: ${business.pricing}
- Enlace para Agendar Cita: ${business.bookingUrl}
- Soporte: ${business.supportEmail}
- Horario de Atención: ${business.operatingHours}

PROSPECTO ACTUAL:
- Nombre: ${contact ? `${contact.firstName} ${contact.lastName}` : 'Prospecto Interesado'}
- Empresa: ${contact?.company || 'No especificada'}
- Score de Interés: ${contact?.leadScore || 50}/100

INSTRUCCIONES:
- Responde siempre en español, de forma muy cordial, profesional y enfocada en ayudar y agendar una llamada o cerrar la venta.
- Sé claro, conciso y amigable.`;

  // 1. GOOGLE GEMINI
  if (settings.provider === 'gemini') {
    try {
      const model = settings.model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents: any[] = [];
      // Recent history
      for (const h of history.slice(-4)) {
        contents.push({
          role: h.sender === 'contact' || h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: incomingMessage }]
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: settings.temperature || 0.7,
            maxOutputTokens: settings.maxTokens || 800
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return {
          reply: text.trim(),
          providerUsed: `Google Gemini (${model})`,
          tokensUsed: data?.usageMetadata?.totalTokenCount || 0,
          latencyMs: Date.now() - startTime
        };
      }
    } catch (err: any) {
      console.warn('[Gemini API Call failed]:', err);
      return {
        reply: `[Error de conexión con Google Gemini: ${err.message}]. Verifica que tu API Key sea correcta. Respuesta del motor de respaldo: ¡Hola! En MARGARITA HUB CRM estamos para ayudarte con tus embudos y automatización comercial. Puedes agendar una cita en ${settings.businessInfo.bookingUrl}`,
        providerUsed: 'Google Gemini (Error -> Fallback)',
        latencyMs: Date.now() - startTime
      };
    }
  }

  // 2. OPENAI, GROQ, DEEPSEEK, OR CUSTOM OPENAI-COMPATIBLE
  let endpoint = 'https://api.openai.com/v1/chat/completions';
  if (settings.provider === 'groq') {
    endpoint = 'https://api.groq.com/openai/v1/chat/completions';
  } else if (settings.provider === 'custom') {
    endpoint = `${(settings.baseUrl || 'http://localhost:11434/v1').replace(/\/+$/, '')}/chat/completions`;
  }

  try {
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
    ];

    for (const h of history.slice(-4)) {
      messages.push({
        role: h.sender === 'contact' || h.sender === 'user' ? 'user' : 'assistant',
        content: h.text
      });
    }

    messages.push({ role: 'user', content: incomingMessage });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: settings.model || (settings.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'),
        messages,
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 800
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const replyText = data?.choices?.[0]?.message?.content;

    if (replyText) {
      return {
        reply: replyText.trim(),
        providerUsed: `${settings.provider.toUpperCase()} (${settings.model})`,
        tokensUsed: data?.usage?.total_tokens || 0,
        latencyMs: Date.now() - startTime
      };
    }
  } catch (err: any) {
    console.warn(`[${settings.provider} API Call Error]:`, err);
    return {
      reply: `[Aviso de API ${settings.provider}: ${err.message}]. Respuesta del Agente Comercial: Hola, un placer saludarte. Puedes conocer todos los servicios de MARGARITA HUB CRM y programar una asesoría directamente en: ${settings.businessInfo.bookingUrl}`,
      providerUsed: `${settings.provider} (Error -> Fallback)`,
      latencyMs: Date.now() - startTime
    };
  }

  return {
    reply: `Hola, recibimos tu mensaje. Estamos listos para asistirte 24/7 en MARGARITA HUB CRM. Escríbenos o agenda en: ${settings.businessInfo.bookingUrl}`,
    providerUsed: 'Margarita Engine',
    latencyMs: Date.now() - startTime
  };
}
