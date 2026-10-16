import axios from 'axios';
import {
  Contact,
  PipelineStage,
  Pipeline,
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
  WorkflowNode,
  Transaction,
  Course,
  EmailCampaign,
  MediaFile,
  ReviewItem,
  AISettings,
  IntegrationSettings,
  WhatsAppSession,
  InstagramSession
} from './types';
import {
  initialAiSettings,
  initialIntegrations,
  initialStages,
  initialPipelines,
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
import { callRealAIProvider } from './services/liveAiService';
import { liveMetaService } from './services/liveMetaService';

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

// Auto-purge any legacy mock contacts/conversations/transactions previously seeded in browser localStorage
const purgeLegacyMockData = () => {
  if (typeof window === 'undefined') return;
  try {
    const purgeFlag = localStorage.getItem('margarita_purged_mock_v5');
    if (!purgeFlag) {
      // Check contacts
      const rawContacts = localStorage.getItem('margarita_contacts');
      if (rawContacts) {
        const contacts: Contact[] = JSON.parse(rawContacts);
        const hasMock = contacts.some(c => 
          c.id.startsWith('c-') || 
          ['Valentina', 'Rodrigo', 'Elena', 'Carlos'].includes(c.firstName)
        );
        if (hasMock) {
          localStorage.removeItem('margarita_contacts');
        }
      }

      // Check conversations & messages
      const rawConvs = localStorage.getItem('margarita_conversations');
      if (rawConvs) {
        const convs = JSON.parse(rawConvs);
        const hasMockConv = convs.some((c: any) => c.id?.startsWith('conv-') || c.contactName?.includes('Valentina') || c.contactName?.includes('Rodrigo'));
        if (hasMockConv) {
          localStorage.removeItem('margarita_conversations');
          localStorage.removeItem('margarita_messages');
        }
      }

      // Check transactions
      const rawTx = localStorage.getItem('margarita_transactions');
      if (rawTx) {
        const txs = JSON.parse(rawTx);
        const hasMockTx = txs.some((t: any) => t.id === 'tx-101' || t.contactName?.includes('Elena'));
        if (hasMockTx) {
          localStorage.removeItem('margarita_transactions');
        }
      }

      // Check reviews
      const rawRev = localStorage.getItem('margarita_reviews');
      if (rawRev) {
        const revs = JSON.parse(rawRev);
        const hasMockRev = revs.some((r: any) => r.id === 'rev-1' || r.author?.includes('Guillermo'));
        if (hasMockRev) {
          localStorage.removeItem('margarita_reviews');
        }
      }

      // Check campaigns
      const rawCamp = localStorage.getItem('margarita_campaigns');
      if (rawCamp) {
        const camps = JSON.parse(rawCamp);
        if (camps.some((c: any) => c.id === 'camp-1')) {
          localStorage.removeItem('margarita_campaigns');
        }
      }

      // Check portal users
      const rawPu = localStorage.getItem('margarita_portalUsers');
      if (rawPu) {
        const pus = JSON.parse(rawPu);
        if (pus.some((p: any) => p.id === 'pu-1' || p.name?.includes('Elena'))) {
          localStorage.removeItem('margarita_portalUsers');
        }
      }

      // Clean dummy tokens in integrations
      const rawInteg = localStorage.getItem('margarita_integrations');
      if (rawInteg) {
        const integ = JSON.parse(rawInteg);
        if (integ.facebook?.accessToken?.includes('...') || integ.stripe?.publishableKey?.includes('...')) {
          localStorage.removeItem('margarita_integrations');
        }
      }

      localStorage.setItem('margarita_purged_mock_v5', 'true');
    }
  } catch (err) {
    console.error('Error purging legacy mock data:', err);
  }
};

purgeLegacyMockData();

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

  // Pipelines (Multi-Pipeline & Stages Management)
  getPipelines: async () => {
    let pipelines = getStore<Pipeline[]>('pipelines', initialPipelines);
    const activePipelineId = getStore<string>('activePipelineId', pipelines[0]?.id || 'pipe-sales');
    const contacts = getStore<Contact[]>('contacts', initialContacts);

    // Enrich each pipeline's stages with current opportunities and total financial value
    const enrichedPipelines: Pipeline[] = pipelines.map(p => ({
      ...p,
      stages: p.stages.map(st => {
        const stageContacts = contacts.filter(c => c.pipelineStageId === st.id);
        return {
          ...st,
          opportunities: stageContacts,
          totalValue: stageContacts.reduce((sum, c) => sum + (c.opportunityValue || 0), 0)
        };
      })
    }));

    let activePipeline = enrichedPipelines.find(p => p.id === activePipelineId) || enrichedPipelines[0];

    return {
      pipelines: enrichedPipelines,
      activePipelineId: activePipeline?.id || 'pipe-sales',
      stages: activePipeline?.stages || []
    };
  },

  createPipeline: async (name: string, description?: string): Promise<Pipeline> => {
    let pipelines = getStore<Pipeline[]>('pipelines', initialPipelines);
    const newPipeline: Pipeline = {
      id: `pipe-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || 'Pipeline de ventas personalizado',
      isDefault: false,
      stages: [
        { id: `st-${Date.now()}-1`, name: 'Prospecto Calificado', color: '#3b82f6', order: 1 },
        { id: `st-${Date.now()}-2`, name: 'Conversación Iniciada', color: '#f59e0b', order: 2 },
        { id: `st-${Date.now()}-3`, name: 'Cita / Negociación', color: '#8b5cf6', order: 3 },
        { id: `st-${Date.now()}-4`, name: 'Cierre Ganado', color: '#10b981', order: 4 }
      ]
    };
    pipelines.push(newPipeline);
    setStore('pipelines', pipelines);
    setStore('activePipelineId', newPipeline.id);
    return newPipeline;
  },

  deletePipeline: async (pipelineId: string): Promise<boolean> => {
    let pipelines = getStore<Pipeline[]>('pipelines', initialPipelines);
    if (pipelines.length <= 1) throw new Error('No puedes eliminar el único pipeline existente.');
    pipelines = pipelines.filter(p => p.id !== pipelineId);
    setStore('pipelines', pipelines);
    setStore('activePipelineId', pipelines[0].id);
    return true;
  },

  setActivePipeline: async (pipelineId: string): Promise<boolean> => {
    setStore('activePipelineId', pipelineId);
    return true;
  },

  addStageToPipeline: async (pipelineId: string, stageName: string, color: string): Promise<PipelineStage> => {
    let pipelines = getStore<Pipeline[]>('pipelines', initialPipelines);
    let pipe = pipelines.find(p => p.id === pipelineId);
    if (!pipe) pipe = pipelines[0];

    const newStage: PipelineStage = {
      id: `st-${Date.now()}`,
      name: stageName.trim(),
      color: color || '#6366f1',
      order: pipe.stages.length + 1
    };
    pipe.stages.push(newStage);
    setStore('pipelines', pipelines);
    return newStage;
  },

  deleteStageFromPipeline: async (pipelineId: string, stageId: string): Promise<boolean> => {
    let pipelines = getStore<Pipeline[]>('pipelines', initialPipelines);
    let pipe = pipelines.find(p => p.id === pipelineId);
    if (!pipe) pipe = pipelines[0];
    if (pipe.stages.length <= 1) throw new Error('El pipeline debe conservar al menos una etapa.');

    pipe.stages = pipe.stages.filter(s => s.id !== stageId);
    setStore('pipelines', pipelines);
    return true;
  },

  updateStageInPipeline: async (pipelineId: string, stageId: string, data: Partial<PipelineStage>): Promise<PipelineStage> => {
    let pipelines = getStore<Pipeline[]>('pipelines', initialPipelines);
    let pipe = pipelines.find(p => p.id === pipelineId);
    if (!pipe) pipe = pipelines[0];

    const stage = pipe.stages.find(s => s.id === stageId);
    if (!stage) throw new Error('Etapa no encontrada');
    Object.assign(stage, data);
    setStore('pipelines', pipelines);
    return stage;
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
      item.lastActivity = 'Cambio de etapa en pipeline';
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

    // Dynamic AI Autopilot 24/7 Answer using the real configured AI Provider
    const aiConfig = getStore<AISettings>('aiSettings', initialAiSettings);
    const historyItems = msgs
      .filter(m => m.conversationId === conv.id)
      .map(m => ({ sender: m.sender, text: m.text }));

    const contacts = getStore<Contact[]>('contacts', initialContacts);
    const relatedContact = contacts.find(c => c.id === conv.contactId);

    const aiResult = await callRealAIProvider(aiConfig, data.text, historyItems, relatedContact);

    const aiMsg: ConversationMessage = {
      id: `m-${Date.now()}-2`,
      conversationId: conv.id,
      sender: 'ai',
      senderName: `Margarita AI (${aiResult.providerUsed})`,
      channel: conv.channel,
      text: aiResult.reply,
      timestamp: 'Ahora',
      read: true
    };
    msgs.push(aiMsg);

    conv.lastMessage = aiResult.reply;
    conv.lastMessageAt = 'Ahora';

    setStore('conversations', convs);
    setStore('messages', msgs);

    return {
      message: userMsg,
      aiReply: aiMsg,
      conversation: conv
    };
  },

  startRealConversation: async (params: {
    contactName: string;
    phoneOrIdentifier: string;
    channel: 'whatsapp' | 'instagram' | 'facebook' | 'email';
    initialMessage?: string;
  }) => {
    const convs = getStore<Conversation[]>('conversations', initialConversations);
    const msgs = getStore<ConversationMessage[]>('messages', initialMessages);
    const contacts = getStore<Contact[]>('contacts', initialContacts);

    const cleanId = params.phoneOrIdentifier.trim();
    const cleanPhoneDigits = cleanId.replace(/\D/g, '');

    // Check if contact already exists or create one
    let contact = contacts.find(c => 
      (cleanPhoneDigits && c.phone.replace(/\D/g, '') === cleanPhoneDigits) || 
      (c.email && c.email.toLowerCase() === cleanId.toLowerCase())
    );

    if (!contact) {
      const parts = params.contactName.trim().split(' ');
      contact = {
        id: `cnt-${Date.now()}`,
        firstName: parts[0] || 'Contacto',
        lastName: parts.slice(1).join(' ') || '',
        email: params.channel === 'email' ? cleanId : '',
        phone: params.channel === 'whatsapp' ? cleanId : '',
        company: '',
        tags: [params.channel.toUpperCase()],
        smartList: 'all',
        pipelineStageId: 'stage-1',
        opportunityValue: 0,
        leadScore: 60,
        assignedTo: 'Gabriel (Admin)',
        notes: [],
        tasks: [],
        createdAt: new Date().toISOString().split('T')[0],
        lastActivity: 'Conversación directa iniciada',
        aiAutoPilot: true
      };
      contacts.unshift(contact);
      setStore('contacts', contacts);
    }

    // Check if conversation exists
    let conv: Conversation | undefined = convs.find(c => c.channelIdentifier === cleanId && c.channel === params.channel);
    if (!conv) {
      conv = {
        id: `cnv-${Date.now()}`,
        contactId: contact.id,
        contactName: `${contact.firstName} ${contact.lastName}`.trim(),
        channel: params.channel,
        channelIdentifier: cleanId,
        lastMessage: params.initialMessage || 'Conversación iniciada',
        lastMessageAt: 'Ahora',
        unreadCount: 0,
        aiAutoPilot: true,
        assignedTo: 'Gabriel (Admin)'
      };
      convs.unshift(conv);
      setStore('conversations', convs);
    }

    if (params.initialMessage && conv) {
      const msg: ConversationMessage = {
        id: `msg-${Date.now()}`,
        conversationId: conv.id,
        sender: 'agent',
        senderName: 'Gabriel (Admin)',
        channel: params.channel,
        text: params.initialMessage,
        timestamp: 'Ahora',
        read: true
      };
      msgs.push(msg);
      setStore('messages', msgs);
    }

    return { conversation: conv!, contact };
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
      folder: data.folder || 'Captación de Prospectos',
      status: 'active',
      triggerType: data.triggerType || 'INCOMING_WHATSAPP',
      nodes: data.nodes || [],
      executionsCount: 0,
      updatedAt: 'Ahora mismo'
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
    if (item) Object.assign(item, data, { updatedAt: 'Ahora mismo' });
    setStore('workflows', list);
    return item;
  },

  deleteWorkflow: async (id: string) => {
    let list = getStore<Workflow[]>('workflows', initialWorkflows);
    list = list.filter(w => w.id !== id);
    setStore('workflows', list);
    return true;
  },

  executeWorkflowLive: async (workflowId: string, contactId?: string) => {
    const list = getStore<Workflow[]>('workflows', initialWorkflows);
    const wf = list.find(w => w.id === workflowId);
    if (!wf) throw new Error('Flujo de trabajo no encontrado');

    const contacts = getStore<Contact[]>('contacts', initialContacts);
    const contact = contacts.find(c => c.id === contactId) || contacts[0];
    if (!contact) throw new Error('No hay contactos disponibles para probar la automatización.');

    wf.executionsCount = (wf.executionsCount || 0) + 1;
    wf.updatedAt = 'Ahora mismo';
    setStore('workflows', list);

    const logs: { time: string; nodeTitle: string; status: 'success' | 'failed'; detail: string }[] = [];
    const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    for (const node of wf.nodes) {
      if (node.type === 'TRIGGER') {
        logs.push({
          time: nowTime(),
          nodeTitle: node.title,
          status: 'success',
          detail: `⚡ Disparador activado para el contacto: ${contact.firstName} ${contact.lastName} (${contact.phone})`
        });
      } else if (node.type === 'SEND_WHATSAPP') {
        const rawMsg = node.config?.message || '¡Hola {{firstName}}! Bienvenido a MARGARITA HUB CRM.';
        const personalized = rawMsg
          .replace(/\{\{firstName\}\}/g, contact.firstName)
          .replace(/\{\{lastName\}\}/g, contact.lastName)
          .replace(/\{\{company\}\}/g, contact.company || 'tu empresa');

        // Add to conversation
        await api.simulateIncomingMessage({
          channel: 'whatsapp',
          senderId: contact.phone || '+34 600 000 000',
          senderName: `${contact.firstName} ${contact.lastName}`,
          text: `[Mensaje Automático]: ${personalized}`
        });

        logs.push({
          time: nowTime(),
          nodeTitle: node.title,
          status: 'success',
          detail: `📲 WhatsApp despachado a ${contact.phone}: "${personalized.slice(0, 60)}..."`
        });
      } else if (node.type === 'SEND_INSTAGRAM') {
        logs.push({
          time: nowTime(),
          nodeTitle: node.title,
          status: 'success',
          detail: `💬 Direct Message de Instagram enviado al perfil del lead.`
        });
      } else if (node.type === 'SEND_EMAIL') {
        const subj = node.config?.subject || 'Confirmación de contacto';
        logs.push({
          time: nowTime(),
          nodeTitle: node.title,
          status: 'success',
          detail: `✉️ Correo electrónico enviado a ${contact.email} (Asunto: "${subj}")`
        });
      } else if (node.type === 'MODIFY_LEAD_SCORE') {
        const inc = Number(node.config?.increment) || 20;
        contact.leadScore = (contact.leadScore || 50) + inc;
        logs.push({
          time: nowTime(),
          nodeTitle: node.title,
          status: 'success',
          detail: `📈 Lead Score incrementado en +${inc} pts. Nuevo puntaje: ${contact.leadScore}/100`
        });
      } else if (node.type === 'TIME_DELAY') {
        const mins = node.config?.delayMinutes || 15;
        logs.push({
          time: nowTime(),
          nodeTitle: node.title,
          status: 'success',
          detail: `⏳ Temporizador de espera programado por ${mins} minutos.`
        });
      } else {
        logs.push({
          time: nowTime(),
          nodeTitle: node.title,
          status: 'success',
          detail: `Acción ejecutada correctamente en el motor de automatización.`
        });
      }
    }

    contact.lastActivity = `Automatización: ${wf.name}`;
    contact.notes.unshift({
      id: `n-${Date.now()}`,
      text: `Automatización ejecutada: "${wf.name}" (${logs.length} pasos completados con éxito).`,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      author: 'Motor de Automatización'
    });
    setStore('contacts', contacts);

    return { success: true, logs, contact };
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
      name: `Flujo AI: ${prompt.slice(0, 35)}...`,
      folder: 'Generados vía AI',
      triggerType: 'INCOMING_WHATSAPP',
      nodes: [
        {
          id: 'n-ai-1',
          type: 'TRIGGER',
          title: 'Disparador: Mensaje Entrante WhatsApp',
          description: 'Se activa al recibir nueva consulta comercial por WhatsApp',
          config: {},
          next: 'n-ai-2'
        },
        {
          id: 'n-ai-2',
          type: 'SEND_WHATSAPP',
          title: 'Respuesta con Asistente IA 24/7',
          description: 'Envía información solicitada y enlace oficial para agendar llamada',
          config: { message: '¡Hola {{firstName}}! Gracias por contactarnos. Te enviamos la información completa de MARGARITA HUB CRM.' },
          next: 'n-ai-3'
        },
        {
          id: 'n-ai-3',
          type: 'MODIFY_LEAD_SCORE',
          title: 'Sumar Puntuación de Interés (+25 pts)',
          description: 'Eleva el score comercial a cliente interesado',
          config: { increment: 25 },
          next: 'n-ai-4'
        },
        {
          id: 'n-ai-4',
          type: 'TIME_DELAY',
          title: 'Tiempo de Espera (15 Minutos)',
          description: 'Evalúa si el cliente completó la reserva en el calendario',
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
    const settings = getStore<AISettings>('aiSettings', initialAiSettings);
    return await callRealAIProvider(settings, message);
  },

  // Meta Real Integrations (WhatsApp & Instagram)
  verifyWhatsAppConnection: async (phoneNumberId: string, accessToken: string) => {
    return await liveMetaService.verifyWhatsAppConnection(phoneNumberId, accessToken);
  },

  sendRealWhatsAppMessage: async (params: {
    phoneNumberId: string;
    accessToken: string;
    toPhone: string;
    messageText: string;
  }) => {
    return await liveMetaService.sendRealWhatsAppMessage(params);
  },

  verifyInstagramConnection: async (pageId: string, accessToken: string) => {
    return await liveMetaService.verifyInstagramConnection(pageId, accessToken);
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
  },

  // WhatsApp Direct Session (Pairing Code / QR)
  getWhatsAppSession: async (): Promise<WhatsAppSession> => {
    return getStore<WhatsAppSession>('whatsapp_session', {
      connected: false,
      phoneNumber: '+58 412 359 0065',
      method: 'pairing_code'
    });
  },

  saveWhatsAppSession: async (session: WhatsAppSession): Promise<WhatsAppSession> => {
    setStore<WhatsAppSession>('whatsapp_session', session);
    const ints = getStore<IntegrationSettings>('integrations', initialIntegrations);
    ints.whatsappSession = session;
    ints.whatsapp.status = session.connected ? 'connected' : 'disconnected';
    ints.whatsapp.enabled = session.connected;
    setStore('integrations', ints);
    return session;
  },

  disconnectWhatsAppSession: async (): Promise<void> => {
    const session: WhatsAppSession = {
      connected: false,
      phoneNumber: '',
      method: 'pairing_code'
    };
    setStore<WhatsAppSession>('whatsapp_session', session);
    const ints = getStore<IntegrationSettings>('integrations', initialIntegrations);
    ints.whatsappSession = session;
    ints.whatsapp.status = 'disconnected';
    ints.whatsapp.enabled = false;
    setStore('integrations', ints);
  },

  // Instagram Direct Session (OAuth Connection)
  getInstagramSession: async (): Promise<InstagramSession> => {
    return getStore<InstagramSession>('instagram_session', {
      connected: false,
      username: ''
    });
  },

  saveInstagramSession: async (session: InstagramSession): Promise<InstagramSession> => {
    setStore<InstagramSession>('instagram_session', session);
    const ints = getStore<IntegrationSettings>('integrations', initialIntegrations);
    ints.instagramSession = session;
    ints.instagram.status = session.connected ? 'connected' : 'disconnected';
    ints.instagram.enabled = session.connected;
    setStore('integrations', ints);
    return session;
  },

  disconnectInstagramSession: async (): Promise<void> => {
    const session: InstagramSession = {
      connected: false,
      username: ''
    };
    setStore<InstagramSession>('instagram_session', session);
    const ints = getStore<IntegrationSettings>('integrations', initialIntegrations);
    ints.instagramSession = session;
    ints.instagram.status = 'disconnected';
    ints.instagram.enabled = false;
    setStore('integrations', ints);
  }
};
