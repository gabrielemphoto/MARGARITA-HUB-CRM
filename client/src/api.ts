import axios from 'axios';
import {
  Contact,
  PipelineStage,
  Conversation,
  ConversationMessage,
  Appointment,
  Funnel,
  FormItem,
  SurveyItem,
  SiteItem,
  WebinarItem,
  ClientPortalUser,
  Workflow,
  Transaction,
  Course,
  EmailCampaign,
  MediaFile,
  ReviewItem,
  AISettings,
  IntegrationSettings
} from './types';
import {
  initialAiSettings,
  initialIntegrations,
  initialStages,
  initialContacts,
  initialConversations,
  initialMessages,
  initialAppointments,
  initialFunnels,
  initialForms,
  initialSurveys,
  initialSites,
  initialWebinars,
  initialPortalUsers,
  initialWorkflows,
  initialTransactions,
  initialCourses,
  initialCampaigns,
  initialMedia,
  initialReviews
} from './mockData';

// LocalStorage helper for offline / GitHub Pages mode
const getStore = <T>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(`margarita_${key}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return defaultVal;
};

const setStore = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(`margarita_${key}`, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
};

const API = axios.create({
  baseURL: '/api',
  timeout: 4000
});

// Detect static hosting (e.g. github.io)
const isStaticHost = typeof window !== 'undefined' && window.location.hostname.includes('github.io');

export const api = {
  // Dashboard
  getDashboard: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get('/dashboard');
        return r.data;
      } catch (e) {
        // Fallback to local
      }
    }
    const contacts = getStore<Contact[]>('contacts', initialContacts);
    const stages = getStore<PipelineStage[]>('stages', initialStages);
    const funnels = getStore<Funnel[]>('funnels', initialFunnels);
    const convs = getStore<Conversation[]>('conversations', initialConversations);

    const totalOpportunities = contacts.length;
    const pipelineValue = contacts.reduce((acc, c) => acc + (c.opportunityValue || 0), 0);
    const wonContacts = contacts.filter(c => c.pipelineStageId === 'stage-5');
    const wonValue = wonContacts.reduce((acc, c) => acc + (c.opportunityValue || 0), 0);
    const conversionRate = totalOpportunities > 0 ? ((wonContacts.length / totalOpportunities) * 100).toFixed(1) : '0';

    return {
      kpis: {
        totalOpportunities,
        pipelineValue,
        conversionRate: `${conversionRate}%`,
        wonRevenue: wonValue,
        activeAIInteractions: convs.filter(c => c.aiAutoPilot).length
      },
      stageDistribution: stages.map(st => {
        const cInStage = contacts.filter(c => c.pipelineStageId === st.id);
        return {
          id: st.id,
          name: st.name,
          color: st.color,
          count: cInStage.length,
          value: cInStage.reduce((acc, c) => acc + (c.opportunityValue || 0), 0)
        };
      }),
      funnelsData: funnels.map(f => ({
        name: f.name,
        visits: f.totalVisits,
        conversions: f.totalConversions,
        revenue: f.totalRevenue,
        rate: f.totalVisits > 0 ? ((f.totalConversions / f.totalVisits) * 100).toFixed(1) : '0'
      })),
      channelStats: {
        whatsapp: convs.filter(c => c.channel === 'whatsapp').length,
        instagram: convs.filter(c => c.channel === 'instagram').length,
        facebook: convs.filter(c => c.channel === 'facebook').length,
        email: convs.filter(c => c.channel === 'email').length,
        webchat: convs.filter(c => c.channel === 'webchat').length
      },
      recentActivity: contacts.slice(0, 5).map(c => ({
        contact: `${c.firstName} ${c.lastName}`,
        company: c.company,
        activity: c.lastActivity,
        leadScore: c.leadScore,
        value: c.opportunityValue,
        stage: stages.find(s => s.id === c.pipelineStageId)?.name || 'Lead'
      }))
    };
  },

  // Contacts
  getContacts: async (params?: { search?: string; tag?: string; stage?: string }) => {
    if (!isStaticHost) {
      try {
        const r = await API.get<Contact[]>('/contacts', { params });
        return r.data;
      } catch (e) {}
    }
    let list = getStore<Contact[]>('contacts', initialContacts);
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(c => c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    return list;
  },

  createContact: async (data: Partial<Contact>) => {
    if (!isStaticHost) {
      try {
        const r = await API.post<Contact>('/contacts', data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Contact[]>('contacts', initialContacts);
    const newC: Contact = {
      id: `c-${Date.now()}`,
      firstName: data.firstName || 'Nuevo',
      lastName: data.lastName || 'Contacto',
      email: data.email || 'lead@margaritahub.com',
      phone: data.phone || '+34 600 000 000',
      company: data.company || 'Empresa',
      tags: data.tags || ['Nuevo Prospecto'],
      smartList: 'Leads de Alta Prioridad',
      pipelineStageId: data.pipelineStageId || 'stage-1',
      opportunityValue: data.opportunityValue || 1500,
      leadScore: 60,
      assignedTo: 'Carlos Méndez',
      notes: [],
      tasks: [],
      createdAt: new Date().toISOString().slice(0, 10),
      lastActivity: 'Ahora mismo',
      aiAutoPilot: data.aiAutoPilot !== false
    };
    list.unshift(newC);
    setStore('contacts', list);
    return newC;
  },

  updateContact: async (id: string, data: Partial<Contact>) => {
    if (!isStaticHost) {
      try {
        const r = await API.put<Contact>(`/contacts/${id}`, data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Contact[]>('contacts', initialContacts);
    const item = list.find(c => c.id === id);
    if (item) Object.assign(item, data);
    setStore('contacts', list);
    return item;
  },

  deleteContact: async (id: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.delete(`/contacts/${id}`);
        return r.data;
      } catch (e) {}
    }
    let list = getStore<Contact[]>('contacts', initialContacts);
    list = list.filter(c => c.id !== id);
    setStore('contacts', list);
    return { success: true };
  },

  addContactNote: async (id: string, text: string, author?: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.post(`/contacts/${id}/notes`, { text, author });
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Contact[]>('contacts', initialContacts);
    const item = list.find(c => c.id === id);
    const note = { id: `n-${Date.now()}`, text, createdAt: 'Ahora', author: author || 'Asesor' };
    if (item) item.notes.unshift(note);
    setStore('contacts', list);
    return note;
  },

  addContactTask: async (id: string, title: string, dueDate: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.post(`/contacts/${id}/tasks`, { title, dueDate });
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Contact[]>('contacts', initialContacts);
    const item = list.find(c => c.id === id);
    const task = { id: `t-${Date.now()}`, title, dueDate, completed: false };
    if (item) item.tasks.push(task);
    setStore('contacts', list);
    return task;
  },

  // Pipelines
  getPipelines: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<{ stages: PipelineStage[] }>('/pipelines');
        return r.data;
      } catch (e) {}
    }
    const stages = getStore<PipelineStage[]>('stages', initialStages);
    const contacts = getStore<Contact[]>('contacts', initialContacts);
    return {
      stages: stages.map(st => {
        const stageContacts = contacts.filter(c => c.pipelineStageId === st.id);
        return {
          ...st,
          opportunities: stageContacts,
          totalValue: stageContacts.reduce((sum, c) => sum + (c.opportunityValue || 0), 0)
        };
      })
    };
  },

  moveContactStage: async (contactId: string, stageId: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.put(`/contacts/${contactId}/stage`, { stageId });
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Contact[]>('contacts', initialContacts);
    const item = list.find(c => c.id === contactId);
    if (item) {
      item.pipelineStageId = stageId;
      item.lastActivity = 'Cambio de etapa';
    }
    setStore('contacts', list);
    return { success: true, contact: item };
  },

  // Conversations & Social
  getConversations: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<Conversation[]>('/conversations');
        return r.data;
      } catch (e) {}
    }
    return getStore<Conversation[]>('conversations', initialConversations);
  },

  getMessages: async (conversationId: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.get<ConversationMessage[]>(`/conversations/${conversationId}/messages`);
        return r.data;
      } catch (e) {}
    }
    const msgs = getStore<ConversationMessage[]>('messages', initialMessages);
    return msgs.filter(m => m.conversationId === conversationId);
  },

  sendMessage: async (conversationId: string, text: string, agentName?: string, mediaUrl?: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.post<ConversationMessage>(`/conversations/${conversationId}/messages`, { text, agentName, mediaUrl });
        return r.data;
      } catch (e) {}
    }
    const msgs = getStore<ConversationMessage[]>('messages', initialMessages);
    const convs = getStore<Conversation[]>('conversations', initialConversations);
    const conv = convs.find(c => c.id === conversationId);
    const newMsg: ConversationMessage = {
      id: `m-${Date.now()}`,
      conversationId,
      sender: 'agent',
      senderName: agentName || 'Asesor Margarita Hub',
      channel: conv?.channel || 'whatsapp',
      text,
      timestamp: 'Ahora',
      read: true,
      mediaUrl
    };
    msgs.push(newMsg);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageAt = 'Ahora';
    }
    setStore('messages', msgs);
    setStore('conversations', convs);
    return newMsg;
  },

  toggleAutopilot: async (conversationId: string, enabled: boolean) => {
    if (!isStaticHost) {
      try {
        const r = await API.put(`/conversations/${conversationId}/autopilot`, { enabled });
        return r.data;
      } catch (e) {}
    }
    const convs = getStore<Conversation[]>('conversations', initialConversations);
    const conv = convs.find(c => c.id === conversationId);
    if (conv) conv.aiAutoPilot = enabled;
    setStore('conversations', convs);
    return { success: true, aiAutoPilot: enabled };
  },

  simulateIncomingMessage: async (data: { channel: string; senderId: string; senderName?: string; text: string }) => {
    if (!isStaticHost) {
      try {
        const r = await API.post('/webhooks/incoming', data);
        return r.data;
      } catch (e) {}
    }

    const convs = getStore<Conversation[]>('conversations', initialConversations);
    const msgs = getStore<ConversationMessage[]>('messages', initialMessages);

    let conv = convs.find(c => c.channelIdentifier === data.senderId);
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        contactId: `c-${Date.now()}`,
        contactName: data.senderName || 'Prospecto',
        channel: data.channel as any,
        channelIdentifier: data.senderId,
        lastMessage: data.text,
        lastMessageAt: 'Ahora',
        unreadCount: 1,
        aiAutoPilot: true,
        assignedTo: 'Carlos Méndez'
      };
      convs.unshift(conv);
    }

    const userMsg: ConversationMessage = {
      id: `m-${Date.now()}-1`,
      conversationId: conv.id,
      sender: 'contact',
      senderName: conv.contactName,
      channel: conv.channel,
      text: data.text,
      timestamp: 'Ahora',
      read: false
    };
    msgs.push(userMsg);

    // AI Autopilot 24/7 Answer
    const aiText = `¡Hola ${conv.contactName.split(' ')[0]}! En MARGARITA HUB CRM tenemos planes desde $97/mes con embudos ilimitados, CRM omnicanal y agentes de IA 24/7 para WhatsApp e Instagram. ¿Te gustaría agendar una llamada de 15 min aquí: https://margaritahub.com/agendar-llamada?`;

    const aiMsg: ConversationMessage = {
      id: `m-${Date.now()}-2`,
      conversationId: conv.id,
      sender: 'ai',
      senderName: 'Margarita AI 24/7 (Native Autopilot)',
      channel: conv.channel,
      text: aiText,
      timestamp: 'Ahora',
      read: true
    };
    msgs.push(aiMsg);

    conv.lastMessage = aiText;
    conv.lastMessageAt = 'Ahora';

    setStore('conversations', convs);
    setStore('messages', msgs);

    return {
      message: userMsg,
      aiReply: aiMsg,
      conversation: conv
    };
  },

  // Calendars
  getAppointments: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<Appointment[]>('/appointments');
        return r.data;
      } catch (e) {}
    }
    return getStore<Appointment[]>('appointments', initialAppointments);
  },

  createAppointment: async (data: Partial<Appointment>) => {
    if (!isStaticHost) {
      try {
        const r = await API.post<Appointment>('/appointments', data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Appointment[]>('appointments', initialAppointments);
    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      title: data.title || 'Cita Comercial',
      contactId: data.contactId || '',
      contactName: data.contactName || 'Prospecto',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone || '',
      serviceType: data.serviceType || 'Demostración',
      date: data.date || new Date().toISOString().slice(0, 10),
      time: data.time || '10:00',
      durationMinutes: data.durationMinutes || 30,
      status: 'confirmed'
    };
    list.unshift(newApp);
    setStore('appointments', list);
    return newApp;
  },

  deleteAppointment: async (id: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.delete(`/appointments/${id}`);
        return r.data;
      } catch (e) {}
    }
    let list = getStore<Appointment[]>('appointments', initialAppointments);
    list = list.filter(a => a.id !== id);
    setStore('appointments', list);
    return { success: true };
  },

  // Funnels
  getFunnels: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<Funnel[]>('/funnels');
        return r.data;
      } catch (e) {}
    }
    return getStore<Funnel[]>('funnels', initialFunnels);
  },

  createFunnel: async (data: Partial<Funnel>) => {
    if (!isStaticHost) {
      try {
        const r = await API.post<Funnel>('/funnels', data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Funnel[]>('funnels', initialFunnels);
    const newF: Funnel = {
      id: `funnel-${Date.now()}`,
      name: data.name || 'Nuevo Embudo',
      domain: data.domain || 'embudo.margaritahub.com',
      status: 'draft',
      steps: [],
      abTestingEnabled: false,
      splitPercentage: 50,
      aiSeo: {
        metaTitle: data.name || 'Embudo',
        metaDescription: 'Embudo de conversión',
        keywords: ['embudo', 'crm'],
        author: 'Margarita Hub',
        ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
      },
      totalVisits: 0,
      totalConversions: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    list.unshift(newF);
    setStore('funnels', list);
    return newF;
  },

  updateFunnel: async (id: string, data: Partial<Funnel>) => {
    if (!isStaticHost) {
      try {
        const r = await API.put<Funnel>(`/funnels/${id}`, data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Funnel[]>('funnels', initialFunnels);
    const item = list.find(f => f.id === id);
    if (item) Object.assign(item, data);
    setStore('funnels', list);
    return item;
  },

  // Forms & Surveys
  getForms: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<FormItem[]>('/forms');
        return r.data;
      } catch (e) {}
    }
    return getStore<FormItem[]>('forms', initialForms);
  },

  createForm: async (data: Partial<FormItem>) => {
    if (!isStaticHost) {
      try {
        const r = await API.post<FormItem>('/forms', data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<FormItem[]>('forms', initialForms);
    const newForm: FormItem = {
      id: `form-${Date.now()}`,
      name: data.name || 'Formulario',
      fields: data.fields || [],
      hasPayment: Boolean(data.hasPayment),
      productName: data.productName,
      productPrice: data.productPrice,
      submissionsCount: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    list.unshift(newForm);
    setStore('forms', list);
    return newForm;
  },

  submitForm: async (id: string, data: any) => {
    if (!isStaticHost) {
      try {
        const r = await API.post(`/forms/${id}/submit`, data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<FormItem[]>('forms', initialForms);
    const item = list.find(f => f.id === id);
    if (item) item.submissionsCount += 1;
    setStore('forms', list);
    return { success: true };
  },

  getSurveys: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<SurveyItem[]>('/surveys');
        return r.data;
      } catch (e) {}
    }
    return getStore<SurveyItem[]>('surveys', initialSurveys);
  },

  createSurvey: async (data: Partial<SurveyItem>) => {
    if (!isStaticHost) {
      try {
        const r = await API.post<SurveyItem>('/surveys', data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<SurveyItem[]>('surveys', initialSurveys);
    const newS: SurveyItem = {
      id: `survey-${Date.now()}`,
      name: data.name || 'Encuesta',
      questions: data.questions || [],
      qualificationThreshold: data.qualificationThreshold || 50,
      submissionsCount: 0,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    list.unshift(newS);
    setStore('surveys', list);
    return newS;
  },

  submitSurvey: async (id: string, data: any) => {
    if (!isStaticHost) {
      try {
        const r = await API.post(`/surveys/${id}/submit`, data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<SurveyItem[]>('surveys', initialSurveys);
    const item = list.find(s => s.id === id);
    if (item) item.submissionsCount += 1;
    setStore('surveys', list);
    return { success: true, qualified: (data.score || 0) >= (item?.qualificationThreshold || 50), score: data.score };
  },

  // Sites, Webinars, Portal
  getSites: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<SiteItem[]>('/sites');
        return r.data;
      } catch (e) {}
    }
    return getStore<SiteItem[]>('sites', initialSites);
  },

  getWebinars: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<WebinarItem[]>('/webinars');
        return r.data;
      } catch (e) {}
    }
    return getStore<WebinarItem[]>('webinars', initialWebinars);
  },

  getPortalUsers: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<ClientPortalUser[]>('/portal/users');
        return r.data;
      } catch (e) {}
    }
    return getStore<ClientPortalUser[]>('portalUsers', initialPortalUsers);
  },

  // Workflows
  getWorkflows: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<Workflow[]>('/workflows');
        return r.data;
      } catch (e) {}
    }
    return getStore<Workflow[]>('workflows', initialWorkflows);
  },

  createWorkflow: async (data: Partial<Workflow>) => {
    if (!isStaticHost) {
      try {
        const r = await API.post<Workflow>('/workflows', data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Workflow[]>('workflows', initialWorkflows);
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      name: data.name || 'Nueva Automatización',
      folder: data.folder || 'Generados vía AI',
      status: 'active',
      triggerType: data.triggerType || 'INCOMING_MESSAGE',
      nodes: data.nodes || [],
      executionsCount: 0,
      updatedAt: 'Ahora'
    };
    list.unshift(newWf);
    setStore('workflows', list);
    return newWf;
  },

  updateWorkflow: async (id: string, data: Partial<Workflow>) => {
    if (!isStaticHost) {
      try {
        const r = await API.put<Workflow>(`/workflows/${id}`, data);
        return r.data;
      } catch (e) {}
    }
    const list = getStore<Workflow[]>('workflows', initialWorkflows);
    const item = list.find(w => w.id === id);
    if (item) Object.assign(item, data);
    setStore('workflows', list);
    return item;
  },

  generateWorkflowAI: async (prompt: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.post('/workflows/ai-generate', { prompt });
        return r.data;
      } catch (e) {}
    }
    // Instant smart client generator
    return {
      name: `Flujo AI: ${prompt.slice(0, 30)}...`,
      folder: 'Generados vía AI',
      triggerType: 'INCOMING_MESSAGE',
      nodes: [
        {
          id: 'n-ai-1',
          type: 'TRIGGER',
          title: 'Disparador: Mensaje entrante multicanal',
          description: 'Se activa al recibir consulta por WhatsApp o Instagram',
          config: {},
          next: 'n-ai-2'
        },
        {
          id: 'n-ai-2',
          type: 'SEND_WHATSAPP',
          title: 'Respuesta con Asistente IA 24/7',
          description: 'Envía información solicitada y enlace a catálogo',
          config: {},
          next: 'n-ai-3'
        },
        {
          id: 'n-ai-3',
          type: 'MODIFY_LEAD_SCORE',
          title: 'Sumar Puntuación de Interés (+20 pts)',
          description: 'Eleva el score comercial a cliente interesado',
          config: { increment: 20 },
          next: 'n-ai-4'
        },
        {
          id: 'n-ai-4',
          type: 'TIME_DELAY',
          title: 'Tiempo de Espera (15 Minutos)',
          description: 'Evalúa si el cliente completó la reserva',
          config: { delayMinutes: 15 }
        }
      ]
    };
  },

  // AI Service
  getAISettings: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<AISettings>('/ai/settings');
        return r.data;
      } catch (e) {}
    }
    return getStore<AISettings>('aiSettings', initialAiSettings);
  },

  updateAISettings: async (settings: Partial<AISettings>) => {
    if (!isStaticHost) {
      try {
        const r = await API.put<AISettings>('/ai/settings', settings);
        return r.data;
      } catch (e) {}
    }
    const current = getStore<AISettings>('aiSettings', initialAiSettings);
    const updated = { ...current, ...settings };
    setStore('aiSettings', updated);
    return updated;
  },

  testAI: async (message: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.post('/ai/test', { message });
        return r.data;
      } catch (e) {}
    }
    return {
      reply: `¡Hola! Soy Margarita AI Assistant de MARGARITA HUB CRM. Respecto a tu consulta sobre "${message}": ofrecemos embudos de venta de alta conversión, CRM omnicanal y agentes de IA 24/7. Puedes reservar una asesoría directa aquí: https://margaritahub.com/agendar-llamada`,
      providerUsed: 'Margarita Autonomous Engine (Native)'
    };
  },

  assistDraft: async (instruction: string, contextText?: string, tone?: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.post<{ draft: string }>('/ai/assist', { instruction, contextText, tone });
        return r.data;
      } catch (e) {}
    }
    return {
      draft: `Hola, un gusto saludarte. En MARGARITA HUB CRM podemos ayudarte a automatizar todo tu flujo de ventas y atención con inteligencia artificial. ¿Te vendría bien agendar una llamada rápida de 10 minutos aquí: https://margaritahub.com/agendar-llamada? Quedo a tu disposición.`
    };
  },

  generateSEO: async (params: { pageTitle: string; businessType: string; targetAudience: string }) => {
    if (!isStaticHost) {
      try {
        const r = await API.post('/ai/seo', params);
        return r.data;
      } catch (e) {}
    }
    return {
      metaTitle: `${params.pageTitle} | MARGARITA HUB CRM`,
      metaDescription: `Optimiza tu captación y ventas con ${params.pageTitle}. Diseñado para ${params.targetAudience} con IA 24/7.`,
      keywords: ['crm', 'agentes ia', 'embudos', 'margarita hub crm'],
      author: 'Margarita Hub',
      ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
    };
  },

  // Monetization, LMS, Marketing, Media, Reviews
  getTransactions: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<Transaction[]>('/payments/transactions');
        return r.data;
      } catch (e) {}
    }
    return getStore<Transaction[]>('transactions', initialTransactions);
  },

  getCourses: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<Course[]>('/memberships/courses');
        return r.data;
      } catch (e) {}
    }
    return getStore<Course[]>('courses', initialCourses);
  },

  getCampaigns: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<EmailCampaign[]>('/marketing/campaigns');
        return r.data;
      } catch (e) {}
    }
    return getStore<EmailCampaign[]>('campaigns', initialCampaigns);
  },

  getMedia: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<MediaFile[]>('/media');
        return r.data;
      } catch (e) {}
    }
    return getStore<MediaFile[]>('media', initialMedia);
  },

  getReviews: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<ReviewItem[]>('/reviews');
        return r.data;
      } catch (e) {}
    }
    return getStore<ReviewItem[]>('reviews', initialReviews);
  },

  replyReview: async (id: string, reply: string) => {
    if (!isStaticHost) {
      try {
        const r = await API.post(`/reviews/${id}/reply`, { reply });
        return r.data;
      } catch (e) {}
    }
    const list = getStore<ReviewItem[]>('reviews', initialReviews);
    const item = list.find(r => r.id === id);
    if (item) item.reply = reply;
    setStore('reviews', list);
    return item;
  },

  // Integrations
  getIntegrations: async () => {
    if (!isStaticHost) {
      try {
        const r = await API.get<IntegrationSettings>('/integrations');
        return r.data;
      } catch (e) {}
    }
    return getStore<IntegrationSettings>('integrations', initialIntegrations);
  },

  updateIntegration: async (platform: string, data: any) => {
    if (!isStaticHost) {
      try {
        const r = await API.put(`/integrations/${platform}`, data);
        return r.data;
      } catch (e) {}
    }
    const ints = getStore<IntegrationSettings>('integrations', initialIntegrations);
    (ints as any)[platform] = { ...(ints as any)[platform], ...data };
    setStore('integrations', ints);
    return (ints as any)[platform];
  }
};
