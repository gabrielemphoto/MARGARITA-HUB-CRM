import { db, AISettings, Contact } from '../db.js';

interface MessageHistoryItem {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class AIService {
  /**
   * Generates a 24/7 AI response to an incoming customer message.
   */
  public async generateChatReply(params: {
    contact?: Contact;
    channel: string;
    incomingMessage: string;
    history: { sender: string; text: string }[];
  }): Promise<{ reply: string; detectedHandover: boolean; providerUsed: string }> {
    const settings = db.get().aiSettings;
    const { contact, channel, incomingMessage, history } = params;

    // Check for human handover trigger
    const lowerMessage = incomingMessage.toLowerCase();
    const handoverKeywords = settings.humanHandoverKeywords || [];
    const detectedHandover = handoverKeywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()));

    if (detectedHandover) {
      return {
        reply: `He registrado que deseas atención humana. Enseguida un especialista de nuestro equipo tomará el control de esta conversación. Si es urgente, por favor indícanos detalles adicionales. ¡Gracias por tu paciencia!`,
        detectedHandover: true,
        providerUsed: 'Luxora Handover Protocol'
      };
    }

    // Build context
    const business = settings.businessInfo;
    const systemPrompt = `${settings.systemPrompt}

DATOS DEL NEGOCIO:
- Empresa: ${business.companyName}
- Servicios: ${business.services}
- Precios y Planes: ${business.pricing}
- Enlace Oficial para Agendar: ${business.bookingUrl}
- Soporte: ${business.supportEmail}
- Horario de Atención: ${business.operatingHours}

CANAL ACTUAL: ${channel.toUpperCase()}
INFORMACIÓN DEL CONTACTO:
- Nombre: ${contact ? `${contact.firstName} ${contact.lastName}` : 'Prospecto'}
- Empresa: ${contact?.company || 'No especificada'}
- Puntuación de Interés: ${contact?.leadScore ?? 50}/100
- Historial / Notas: ${contact?.notes?.map(n => n.text).join('; ') || 'Ninguna previa'}

REGLAS DE RESPUESTA:
- Responde de forma concisa, profesional y cordial en español.
- Si el usuario pregunta por precios o agendar, ofrécele el enlace oficial o pregúntale cuál día le conviene más.
- Nunca inventes promociones que no estén en los datos del negocio.`;

    const messages: MessageHistoryItem[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Append last 6 messages for context
    const recentHistory = history.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'contact' ? 'user' : 'assistant',
        content: msg.text
      });
    }

    // Append the latest user message
    messages.push({ role: 'user', content: incomingMessage });

    // Attempt calling real provider if API key is provided
    if (settings.apiKey && settings.apiKey.trim().length > 5) {
      try {
        const result = await this.callExternalLLM(settings, messages);
        if (result) {
          return { reply: result, detectedHandover: false, providerUsed: `${settings.provider} (${settings.model})` };
        }
      } catch (err) {
        console.warn(`[AI Engine] Provider ${settings.provider} call failed, switching to intelligent fallback engine:`, err);
      }
    }

    // Intelligent built-in simulated engine (24/7 conversational fallback)
    const fallbackReply = this.generateFallbackResponse(incomingMessage, contact, business, channel);
    return {
      reply: fallbackReply,
      detectedHandover: false,
      providerUsed: 'Luxora Autonomous Engine (Native)'
    };
  }

  /**
   * "Escribir con IA": assists human agents in drafting messages, emails, or pitches.
   */
  public async assistDraft(params: {
    instruction: string;
    contextText?: string;
    tone?: 'ejecutivo' | 'persuasivo' | 'cálido' | 'urgente';
  }): Promise<string> {
    const settings = db.get().aiSettings;
    const tone = params.tone || 'ejecutivo';

    const systemPrompt = `Eres un redactor comercial de élite de Luxora Digital. Tu misión es redactar mensajes de ventas, respuestas a clientes y correos electrónicos con alta tasa de respuesta.
Tono solicitado: ${tone}.
Genera ÚNICAMENTE el texto final listo para enviar, sin preámbulos ni comillas.`;

    const userContent = `Instrucción: ${params.instruction}
${params.contextText ? `Contexto del cliente o conversación: ${params.contextText}` : ''}`;

    if (settings.apiKey && settings.apiKey.trim().length > 5) {
      try {
        const result = await this.callExternalLLM(settings, [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]);
        if (result) return result;
      } catch (err) {
        console.warn('[AI Assist] LLM error, using template assistant', err);
      }
    }

    // High quality template assist
    return `Hola ${params.contextText ? 'Estimado/a' : 'amigo/a'}, gracias por ponerte en contacto con nosotros.

Respecto a lo que comentas (${params.instruction}), en Luxora Digital podemos ayudarte a automatizar todo tu flujo de ventas y atención con inteligencia artificial.

¿Te vendría bien que coordinemos una llamada rápida de 10 minutos para mostrártelo en vivo? Puedes elegir el horario que prefieras aquí: ${settings.businessInfo.bookingUrl}

Quedo a tu total disposición.`;
  }

  /**
   * "Construir vía AI": Takes a natural language description and generates a structured workflow!
   */
  public async generateWorkflowFromPrompt(prompt: string): Promise<{
    name: string;
    folder: string;
    triggerType: string;
    nodes: any[];
  }> {
    const settings = db.get().aiSettings;

    const systemPrompt = `Eres un arquitecto de automatizaciones de marketing y ventas en Luxora Digital.
El usuario te dará una idea en lenguaje natural (ej. "Nutrir leads de bienes raíces que piden catálogo por WhatsApp").
Devuelve EXCLUSIVAMENTE un objeto JSON válido con este formato:
{
  "name": "Nombre descriptivo del flujo",
  "folder": "Carpeta temática (ej: Ventas, Bienvenida, Carritos Abandonados)",
  "triggerType": "FORM_SUBMITTED | INCOMING_MESSAGE | APPOINTMENT_BOOKED | PAYMENT_RECEIVED | TAG_ADDED",
  "nodes": [
    {
      "id": "node-1",
      "type": "TRIGGER | SEND_WHATSAPP | SEND_EMAIL | SEND_INSTAGRAM | TIME_DELAY | IF_ELSE | MODIFY_LEAD_SCORE | ASSIGN_USER | INTERNAL_NOTIFICATION",
      "title": "Título del bloque",
      "description": "Qué hace este paso",
      "config": {},
      "next": "node-2"
    }
  ]
}`;

    if (settings.apiKey && settings.apiKey.trim().length > 5) {
      try {
        const response = await this.callExternalLLM(settings, [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]);
        if (response) {
          const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(cleaned);
        }
      } catch (err) {
        console.warn('[AI Workflow] Error from LLM, generating via smart pattern parser', err);
      }
    }

    // Pattern-based smart generator
    return this.generateSmartDefaultWorkflow(prompt);
  }

  /**
   * Generates SEO metadata using AI.
   */
  public async generateSeoMetadata(params: {
    pageTitle: string;
    businessType: string;
    targetAudience: string;
  }) {
    return {
      metaTitle: `${params.pageTitle} | ${params.businessType} de Alto Impacto`,
      metaDescription: `Descubre cómo acelerar tu negocio con ${params.pageTitle}. Diseñado exclusivamente para ${params.targetAudience} que buscan máxima conversión y automatización 24/7.`,
      keywords: [params.businessType.toLowerCase(), 'embudos de venta', 'automatizacion', 'luxora digital', 'crm omnicanal'],
      author: 'Luxora Digital Studio',
      ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
    };
  }

  // Internal: calls external LLMs (OpenAI, Gemini, Claude, Groq, Ollama/Custom)
  private async callExternalLLM(settings: AISettings, messages: MessageHistoryItem[]): Promise<string | null> {
    const { provider, apiKey, model, baseUrl, temperature, maxTokens } = settings;

    // 1. ANTHROPIC CLAUDE
    if (provider === 'anthropic') {
      const systemMsg = messages.find(m => m.role === 'system')?.content || '';
      const conversationMsgs = messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-sonnet-20241022',
          max_tokens: maxTokens || 600,
          temperature: temperature || 0.7,
          system: systemMsg,
          messages: conversationMsgs
        })
      });

      if (!res.ok) throw new Error(`Claude API error: ${res.statusText}`);
      const data: any = await res.json();
      return data?.content?.[0]?.text || null;
    }

    // 2. GOOGLE GEMINI (using Gemini API endpoint or Gemini OpenAI compatible endpoint)
    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gemini-1.5-flash',
          messages,
          temperature: temperature || 0.7,
          max_tokens: maxTokens || 600
        })
      });

      if (!res.ok) {
        // Fallback to standard Google generateContent
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
        const contents = messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
        const gRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents })
        });
        if (!gRes.ok) throw new Error(`Gemini API error: ${gRes.statusText}`);
        const gData: any = await gRes.json();
        return gData?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }

      const data: any = await res.json();
      return data?.choices?.[0]?.message?.content || null;
    }

    // 3. OPENAI, GROQ, or CUSTOM / OLLAMA / LOCALAI
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    if (provider === 'groq') {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (provider === 'custom') {
      const base = (baseUrl || 'http://localhost:11434/v1').replace(/\/+$/, '');
      endpoint = `${base}/chat/completions`;
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || (provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini'),
        messages,
        temperature: temperature || 0.7,
        max_tokens: maxTokens || 600
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`AI API error (${res.status}): ${errorText}`);
    }

    const data: any = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  }

  // Fallback intelligent conversation agent
  private generateFallbackResponse(
    msg: string,
    contact?: Contact,
    business?: any,
    channel?: string
  ): string {
    const text = msg.toLowerCase();
    const name = contact ? contact.firstName : 'estimado/a';

    if (text.includes('precio') || text.includes('cuanto cuesta') || text.includes('costo') || text.includes('planes')) {
      return `¡Hola ${name}! En ${business.companyName} contamos con planes adaptados a cada etapa: desde $97/mes con embudos ilimitados y CRM, hasta $297/mes con agentes de IA 24/7 multicanal y automatizaciones avanzadas. ¿Te gustaría agendar una llamada breve para recomendarte la mejor opción? Puedes elegir tu horario aquí: ${business.bookingUrl}`;
    }

    if (text.includes('agendar') || text.includes('cita') || text.includes('llamada') || text.includes('reunion') || text.includes('demo')) {
      return `¡Con mucho gusto ${name}! Puedes seleccionar directamente el día y hora que mejor te quede en nuestro calendario en línea: ${business.bookingUrl}. La sesión dura 25 minutos y te mostraremos cómo opera la plataforma en tiempo real.`;
    }

    if (text.includes('whatsapp') || text.includes('instagram') || text.includes('facebook') || text.includes('bot') || text.includes('ia')) {
      return `Así es, ${name}. Luxora Digital cuenta con conexión directa a la API de WhatsApp, Instagram DM, Facebook Messenger y chat web con Agentes de Inteligencia Artificial 24/7. Pueden calificar tus leads, responder dudas al instante y sincronizar las oportunidades en tu pipeline sin necesidad de código.`;
    }

    if (text.includes('hola') || text.includes('buenos dias') || text.includes('buenas tardes') || text.includes('buenas noches')) {
      return `¡Hola ${name}! Qué gusto saludarte. Soy el asistente de IA 24/7 de ${business.companyName}. ¿En qué podemos ayudarte hoy? (Puedes consultarme sobre nuestros embudos, CRM, automatizaciones o solicitar una demostración personalizada).`;
    }

    return `¡Gracias por tu mensaje, ${name}! He registrado tu consulta sobre "${msg}". En ${business.companyName} estamos listos para potenciar tus ventas y automatizaciones comerciales. Si deseas que un especialista revise tu caso a fondo, puedes reservar una sesión aquí: ${business.bookingUrl} o responder con tus dudas puntuales.`;
  }

  private generateSmartDefaultWorkflow(prompt: string) {
    const isWhatsApp = prompt.toLowerCase().includes('whatsapp');
    const isLeadScore = prompt.toLowerCase().includes('score') || prompt.toLowerCase().includes('puntos');

    return {
      name: `Flujo Automatizado: ${prompt.slice(0, 40)}...`,
      folder: 'Generados vía IA',
      triggerType: isWhatsApp ? 'INCOMING_MESSAGE' : 'FORM_SUBMITTED',
      nodes: [
        {
          id: 'n-ai-1',
          type: 'TRIGGER',
          title: isWhatsApp ? 'Disparador: Mensaje entrante por WhatsApp' : 'Disparador: Formulario completado',
          description: 'Activa el flujo cuando un prospecto inicia contacto',
          config: { channel: isWhatsApp ? 'whatsapp' : 'web' },
          next: 'n-ai-2'
        },
        {
          id: 'n-ai-2',
          type: 'SEND_WHATSAPP',
          title: 'Respuesta Inmediata con Agente IA',
          description: 'Envía mensaje de bienvenida y activa el análisis conversacional',
          config: { message: '¡Hola {{firstName}}! Gracias por contactar a Luxora Digital. ¿Cómo podemos acelerar tus ventas hoy?' },
          next: 'n-ai-3'
        },
        {
          id: 'n-ai-3',
          type: 'MODIFY_LEAD_SCORE',
          title: 'Sumar Puntuación de Interés (+20)',
          description: 'Eleva el score comercial del contacto',
          config: { increment: 20 },
          next: 'n-ai-4'
        },
        {
          id: 'n-ai-4',
          type: 'TIME_DELAY',
          title: 'Tiempo de Espera (20 Minutos)',
          description: 'Espera para verificar agendamiento de cita',
          config: { delayMinutes: 20 },
          next: 'n-ai-5'
        },
        {
          id: 'n-ai-5',
          type: 'IF_ELSE',
          title: 'Condicional: ¿Tiene Cita Confirmada?',
          description: 'Divide el camino según si agendó en el calendario',
          config: { field: 'hasAppointment', operator: 'equals', value: true },
          nextTrue: 'n-ai-6',
          nextFalse: 'n-ai-7'
        },
        {
          id: 'n-ai-6',
          type: 'INTERNAL_NOTIFICATION',
          title: 'Notificar al Asesor Asignado',
          description: 'Envía alerta al comercial para preparar la reunión',
          config: { message: 'Lead de alta prioridad agendó llamada: {{firstName}}' }
        },
        {
          id: 'n-ai-7',
          type: 'SEND_EMAIL',
          title: 'Email de Seguimiento con Casos de Éxito',
          description: 'Envía testimonios y botón para reservar turno',
          config: { subject: '{{firstName}}, descubre cómo multiplicar tus prospectos', body: 'Te dejamos este caso de estudio y el link a la agenda.' }
        }
      ]
    };
  }
}

export const aiService = new AIService();
