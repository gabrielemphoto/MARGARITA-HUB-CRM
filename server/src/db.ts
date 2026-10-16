import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'luxora_db.json');

export interface AISettings {
  provider: 'openai' | 'gemini' | 'anthropic' | 'groq' | 'custom';
  apiKey: string;
  model: string;
  baseUrl: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  autoPilotEnabled: boolean;
  autoReplyChannels: ('whatsapp' | 'instagram' | 'facebook' | 'email' | 'webchat')[];
  humanHandoverKeywords: string[];
  businessInfo: {
    companyName: string;
    services: string;
    pricing: string;
    bookingUrl: string;
    supportEmail: string;
    operatingHours: string;
  };
}

export interface IntegrationSettings {
  whatsapp: {
    enabled: boolean;
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
    verifyToken: string;
    status: 'connected' | 'disconnected' | 'testing';
  };
  instagram: {
    enabled: boolean;
    pageId: string;
    igUserId: string;
    accessToken: string;
    verifyToken: string;
    status: 'connected' | 'disconnected' | 'testing';
  };
  facebook: {
    enabled: boolean;
    pageId: string;
    accessToken: string;
    verifyToken: string;
    status: 'connected' | 'disconnected' | 'testing';
  };
  email: {
    enabled: boolean;
    provider: 'smtp' | 'resend' | 'sendgrid';
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    fromEmail: string;
    fromName: string;
    status: 'connected' | 'disconnected' | 'testing';
  };
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    status: 'connected' | 'disconnected' | 'testing';
  };
  shopify: {
    enabled: boolean;
    shopDomain: string;
    accessToken: string;
    status: 'connected' | 'disconnected';
  };
  airtable: {
    enabled: boolean;
    apiKey: string;
    baseId: string;
    status: 'connected' | 'disconnected';
  };
  asana: {
    enabled: boolean;
    accessToken: string;
    workspaceId: string;
    status: 'connected' | 'disconnected';
  };
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  tags: string[];
  smartList: string;
  pipelineStageId: string;
  opportunityValue: number;
  leadScore: number;
  birthDate?: string;
  assignedTo: string;
  notes: { id: string; text: string; createdAt: string; author: string }[];
  tasks: { id: string; title: string; dueDate: string; completed: boolean }[];
  createdAt: string;
  lastActivity: string;
  aiAutoPilot: boolean;
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  sender: 'contact' | 'agent' | 'ai';
  senderName: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'webchat';
  text: string;
  timestamp: string;
  read: boolean;
  mediaUrl?: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar?: string;
  channel: 'whatsapp' | 'instagram' | 'facebook' | 'email' | 'webchat';
  channelIdentifier: string; // phone, ig handle, email
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  aiAutoPilot: boolean;
  assignedTo: string;
}

export interface Appointment {
  id: string;
  title: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  serviceType: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: 'confirmed' | 'pending' | 'canceled' | 'completed';
  notes?: string;
}

export interface FunnelStep {
  id: string;
  name: string;
  type: 'optin' | 'sales' | 'checkout' | 'thankyou' | 'upsell';
  path: string;
  visits: number;
  conversions: number;
  aSplitVisits: number;
  bSplitVisits: number;
}

export interface Funnel {
  id: string;
  name: string;
  domain: string;
  status: 'published' | 'draft';
  steps: FunnelStep[];
  abTestingEnabled: boolean;
  splitPercentage: number; // e.g. 50
  aiSeo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    author: string;
    ogImage: string;
  };
  totalVisits: number;
  totalConversions: number;
  totalRevenue: number;
  createdAt: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  category: string;
  fields: { name: string; label: string; type: string; required: boolean }[];
  hasPayment: boolean;
  productPrice?: number;
}

export interface FormItem {
  id: string;
  name: string;
  fields: { name: string; label: string; type: string; required: boolean }[];
  hasPayment: boolean;
  productName?: string;
  productPrice?: number;
  submissionsCount: number;
  createdAt: string;
}

export interface SurveyItem {
  id: string;
  name: string;
  questions: {
    id: string;
    question: string;
    type: 'multiple' | 'text' | 'rating' | 'scale';
    options?: { label: string; score: number }[];
  }[];
  qualificationThreshold: number;
  submissionsCount: number;
  createdAt: string;
}

export interface SiteItem {
  id: string;
  name: string;
  type: 'website' | 'store' | 'blog';
  domain: string;
  pagesCount: number;
  status: 'published' | 'draft';
  updatedAt: string;
  itemsCount?: number; // for stores (products) or blogs (posts)
}

export interface WebinarItem {
  id: string;
  title: string;
  host: string;
  scheduledDate: string;
  scheduledTime: string;
  registeredCount: number;
  liveRoomUrl: string;
  status: 'scheduled' | 'live' | 'finished';
}

export interface ClientPortalUser {
  id: string;
  name: string;
  email: string;
  accessStatus: 'active' | 'suspended';
  enrolledCourses: string[];
  lastLogin: string;
}

export interface WorkflowNode {
  id: string;
  type:
    | 'TRIGGER'
    | 'SEND_WHATSAPP'
    | 'SEND_EMAIL'
    | 'SEND_INSTAGRAM'
    | 'SEND_SMS'
    | 'IF_ELSE'
    | 'TIME_DELAY'
    | 'UPDATE_CONTACT'
    | 'ASSIGN_USER'
    | 'MODIFY_LEAD_SCORE'
    | 'INTERNAL_NOTIFICATION'
    | 'WEBHOOK'
    | 'SHOPIFY_SYNC';
  title: string;
  description: string;
  config: Record<string, any>;
  next?: string;
  nextTrue?: string;
  nextFalse?: string;
}

export interface Workflow {
  id: string;
  name: string;
  folder: string;
  status: 'active' | 'draft';
  triggerType: string;
  nodes: WorkflowNode[];
  executionsCount: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  contactName: string;
  contactEmail: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded';
  gateway: 'stripe' | 'paypal' | 'mercadopago';
  date: string;
  items: { description: string; quantity: number; price: number }[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  studentsCount: number;
  modules: {
    id: string;
    title: string;
    lessons: { id: string; title: string; duration: string; videoUrl?: string }[];
  }[];
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  recipientsCount: number;
  openRate: number;
  clickRate: number;
  status: 'sent' | 'scheduled' | 'draft';
  sentAt?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: string;
  url: string;
  uploadedAt: string;
}

export interface ReviewItem {
  id: string;
  platform: 'google' | 'trustpilot' | 'facebook';
  author: string;
  rating: number;
  content: string;
  date: string;
  reply?: string;
}

export interface DatabaseSchema {
  aiSettings: AISettings;
  integrations: IntegrationSettings;
  contacts: Contact[];
  stages: PipelineStage[];
  conversations: Conversation[];
  messages: ConversationMessage[];
  appointments: Appointment[];
  funnels: Funnel[];
  forms: FormItem[];
  surveys: SurveyItem[];
  sites: SiteItem[];
  webinars: WebinarItem[];
  portalUsers: ClientPortalUser[];
  workflows: Workflow[];
  transactions: Transaction[];
  courses: Course[];
  emailCampaigns: EmailCampaign[];
  media: MediaFile[];
  reviews: ReviewItem[];
}

// Initial Seed Data
const defaultData: DatabaseSchema = {
  aiSettings: {
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    systemPrompt: `Eres Luxora AI Assistant, el asistente comercial inteligente 24/7 de Luxora Digital.
Tu objetivo es atender consultas de clientes y prospectos de manera cálida, ejecutiva y persuasiva.
Proporciona información sobre nuestros servicios (creación de embudos, automatización de marketing, CRM multicanal e integraciones de IA).
Si el usuario muestra interés en contratar o agendar una llamada de asesoría, invítalo cordialmente a reservar en el enlace oficial de la empresa.
Sé conciso, empático y orientado a la conversión comercial.`,
    temperature: 0.7,
    maxTokens: 500,
    autoPilotEnabled: true,
    autoReplyChannels: ['whatsapp', 'instagram', 'facebook', 'email', 'webchat'],
    humanHandoverKeywords: ['hablar con asesor', 'humano', 'agente humano', 'persona real', 'queja urgente'],
    businessInfo: {
      companyName: 'Luxora Digital Hub',
      services: 'Plataforma CRM All-in-One, Embudos de Venta, Marketing Multicanal y Agentes de IA 24/7',
      pricing: 'Planes desde $97/mes (Starter) hasta $297/mes (Enterprise Pro)',
      bookingUrl: 'https://luxora.digital/agendar-llamada',
      supportEmail: 'contacto@luxoradigital.io',
      operatingHours: 'Atención 24/7 con Agentes de Inteligencia Artificial'
    }
  },
  integrations: {
    whatsapp: {
      enabled: true,
      phoneNumberId: '1098234729104',
      wabaId: '3948271049281',
      accessToken: 'EAAQ...LUXORA_WHATSAPP_TOKEN',
      verifyToken: 'luxora_verify_token_2026',
      status: 'connected'
    },
    instagram: {
      enabled: true,
      pageId: '1029384756',
      igUserId: '17841400293847',
      accessToken: 'EAAC...LUXORA_IG_TOKEN',
      verifyToken: 'luxora_ig_webhook_2026',
      status: 'connected'
    },
    facebook: {
      enabled: true,
      pageId: '9988776655',
      accessToken: 'EAAB...LUXORA_FB_TOKEN',
      verifyToken: 'luxora_fb_webhook_2026',
      status: 'connected'
    },
    email: {
      enabled: true,
      provider: 'resend',
      smtpHost: 'smtp.resend.com',
      smtpPort: 465,
      smtpUser: 'resend',
      smtpPass: 're_secret_luxora_92819',
      fromEmail: 'notificaciones@luxoradigital.io',
      fromName: 'Luxora Digital Suite',
      status: 'connected'
    },
    stripe: {
      enabled: true,
      publishableKey: 'pk_live_luxora_51NjK0...',
      secretKey: 'sk_live_luxora_9829...',
      webhookSecret: 'whsec_luxora_webhook_7719',
      status: 'connected'
    },
    shopify: {
      enabled: true,
      shopDomain: 'luxora-store.myshopify.com',
      accessToken: 'shpat_luxora_sync_token',
      status: 'connected'
    },
    airtable: {
      enabled: true,
      apiKey: 'pat_luxora_airtable_token',
      baseId: 'appLuxoraLeads99',
      status: 'connected'
    },
    asana: {
      enabled: false,
      accessToken: '',
      workspaceId: '',
      status: 'disconnected'
    }
  },
  stages: [
    { id: 'stage-1', name: 'Lead Nuevo', color: '#3b82f6', order: 1 },
    { id: 'stage-2', name: 'Contactado / Calificado', color: '#eab308', order: 2 },
    { id: 'stage-3', name: 'Cita Agendada', color: '#8b5cf6', order: 3 },
    { id: 'stage-4', name: 'Propuesta Enviada', color: '#f97316', order: 4 },
    { id: 'stage-5', name: 'Ganado (Vendido)', color: '#10b981', order: 5 },
    { id: 'stage-6', name: 'Perdido', color: '#ef4444', order: 6 }
  ],
  contacts: [
    {
      id: 'c-1',
      firstName: 'Valentina',
      lastName: 'Montes',
      email: 'valentina.montes@innova.com',
      phone: '+34 612 345 678',
      company: 'Innova Retail',
      tags: ['Lead Calificado', 'WhatsApp', 'Interés Funnels'],
      smartList: 'Leads de Alta Prioridad',
      pipelineStageId: 'stage-3',
      opportunityValue: 2400,
      leadScore: 85,
      birthDate: '1992-05-14',
      assignedTo: 'Carlos Méndez',
      notes: [
        { id: 'n-1', text: 'Interesada en migrar sus 4 embudos de ClickFunnels a Luxora Digital.', createdAt: '2026-10-15 11:30', author: 'Carlos' }
      ],
      tasks: [
        { id: 't-1', title: 'Enviar demo grabada de agente IA por WhatsApp', dueDate: '2026-10-17', completed: false }
      ],
      createdAt: '2026-10-12',
      lastActivity: 'Hace 15 min',
      aiAutoPilot: true
    },
    {
      id: 'c-2',
      firstName: 'Rodrigo',
      lastName: 'Sarmiento',
      email: 'rodrigo@sarmientolaw.es',
      phone: '+34 689 112 233',
      company: 'Sarmiento & Asociados',
      tags: ['Instagram DM', 'Abogados', 'Demo Solicitada'],
      smartList: 'Leads de Instagram',
      pipelineStageId: 'stage-2',
      opportunityValue: 1800,
      leadScore: 72,
      birthDate: '1987-11-20',
      assignedTo: 'Ana Belén',
      notes: [
        { id: 'n-2', text: 'Preguntó por integración con WhatsApp 24/7 para atención a clientes.', createdAt: '2026-10-16 09:15', author: 'IA Autopilot' }
      ],
      tasks: [
        { id: 't-2', title: 'Confirmar hora de videollamada para el viernes', dueDate: '2026-10-18', completed: false }
      ],
      createdAt: '2026-10-14',
      lastActivity: 'Hace 1 hora',
      aiAutoPilot: true
    },
    {
      id: 'c-3',
      firstName: 'Elena',
      lastName: 'Gómez',
      email: 'elena@vanguardiafitness.com',
      phone: '+52 55 4910 2938',
      company: 'Vanguardia Fitness',
      tags: ['Webinar Asistido', 'Membresías', 'Comprador VIP'],
      smartList: 'Clientes VIP',
      pipelineStageId: 'stage-5',
      opportunityValue: 3600,
      leadScore: 98,
      birthDate: '1995-03-08',
      assignedTo: 'Carlos Méndez',
      notes: [
        { id: 'n-3', text: 'Compró la membresía anual y contrató la configuración del CRM con agente de IA.', createdAt: '2026-10-14 16:40', author: 'Carlos' }
      ],
      tasks: [],
      createdAt: '2026-10-08',
      lastActivity: 'Ayer',
      aiAutoPilot: false
    },
    {
      id: 'c-4',
      firstName: 'Mateo',
      lastName: 'Bermúdez',
      email: 'mateo@growthagency.co',
      phone: '+57 310 998 8776',
      company: 'Growth Agency Latam',
      tags: ['Formulario Web', 'Agencia', 'Propuesta'],
      smartList: 'Agencias y Partners',
      pipelineStageId: 'stage-4',
      opportunityValue: 4500,
      leadScore: 90,
      birthDate: '1990-08-12',
      assignedTo: 'Carlos Méndez',
      notes: [
        { id: 'n-4', text: 'Revisando propuesta de paquete White-Label para 20 subcuentas.', createdAt: '2026-10-15 18:00', author: 'Carlos' }
      ],
      tasks: [
        { id: 't-3', title: 'Hacer seguimiento de propuesta comercial', dueDate: '2026-10-19', completed: false }
      ],
      createdAt: '2026-10-10',
      lastActivity: 'Hace 4 horas',
      aiAutoPilot: true
    }
  ],
  conversations: [
    {
      id: 'conv-1',
      contactId: 'c-1',
      contactName: 'Valentina Montes',
      channel: 'whatsapp',
      channelIdentifier: '+34 612 345 678',
      lastMessage: 'Perfecto, el agente IA me aclaró todas las dudas sobre el plan Pro.',
      lastMessageAt: '12:10',
      unreadCount: 0,
      aiAutoPilot: true,
      assignedTo: 'Carlos Méndez'
    },
    {
      id: 'conv-2',
      contactId: 'c-2',
      contactName: 'Rodrigo Sarmiento',
      channel: 'instagram',
      channelIdentifier: '@rodrigo.sarmiento',
      lastMessage: 'Hola, ¿el sistema puede responder mensajes en Instagram incluso de noche?',
      lastMessageAt: '11:45',
      unreadCount: 1,
      aiAutoPilot: true,
      assignedTo: 'Ana Belén'
    },
    {
      id: 'conv-3',
      contactId: 'c-4',
      contactName: 'Mateo Bermúdez',
      channel: 'email',
      channelIdentifier: 'mateo@growthagency.co',
      lastMessage: 'Recibí la cotización, estamos revisando con el equipo de finanzas.',
      lastMessageAt: '09:20',
      unreadCount: 0,
      aiAutoPilot: true,
      assignedTo: 'Carlos Méndez'
    }
  ],
  messages: [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      sender: 'contact',
      senderName: 'Valentina Montes',
      channel: 'whatsapp',
      text: 'Hola! Vi el anuncio de Luxora Digital. ¿Tienen opción de conectar agentes de IA que respondan en WhatsApp automáticamente?',
      timestamp: '12:02',
      read: true
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      sender: 'ai',
      senderName: 'Luxora AI Agent 24/7',
      channel: 'whatsapp',
      text: '¡Hola Valentina! Un gusto saludarte. Sí, Luxora Digital cuenta con un motor de Agentes de IA 24/7 nativo para WhatsApp, Instagram, Facebook y Web. Puede calificar prospectos, responder consultas frecuentes y agendar llamadas de manera 100% autónoma. ¿Te gustaría ver una demo en vivo o prefieres agendar una llamada de 15 minutos?',
      timestamp: '12:03',
      read: true
    },
    {
      id: 'm-3',
      conversationId: 'conv-1',
      sender: 'contact',
      senderName: 'Valentina Montes',
      channel: 'whatsapp',
      text: 'Perfecto, el agente IA me aclaró todas las dudas sobre el plan Pro.',
      timestamp: '12:10',
      read: true
    },
    {
      id: 'm-4',
      conversationId: 'conv-2',
      sender: 'contact',
      senderName: 'Rodrigo Sarmiento',
      channel: 'instagram',
      text: 'Hola, ¿el sistema puede responder mensajes en Instagram incluso de noche?',
      timestamp: '11:45',
      read: false
    }
  ],
  appointments: [
    {
      id: 'app-1',
      title: 'Sesión Estratégica Funnels & IA',
      contactId: 'c-1',
      contactName: 'Valentina Montes',
      contactEmail: 'valentina.montes@innova.com',
      contactPhone: '+34 612 345 678',
      serviceType: 'Consultoría Comercial (30 min)',
      date: '2026-10-18',
      time: '16:00',
      durationMinutes: 30,
      status: 'confirmed',
      notes: 'Revisión de migración desde ClickFunnels'
    },
    {
      id: 'app-2',
      title: 'Demo White-Label Partner',
      contactId: 'c-4',
      contactName: 'Mateo Bermúdez',
      contactEmail: 'mateo@growthagency.co',
      contactPhone: '+57 310 998 8776',
      serviceType: 'Presentación de Agencia Partner (45 min)',
      date: '2026-10-19',
      time: '11:00',
      durationMinutes: 45,
      status: 'confirmed',
      notes: 'Demostración de gestión multicuenta'
    }
  ],
  funnels: [
    {
      id: 'funnel-1',
      name: 'Embudo Maestro - Captación de Clientes High-Ticket',
      domain: 'oferta.luxoradigital.io',
      status: 'published',
      steps: [
        { id: 'step-1', name: 'Página de Registro (Opt-in)', type: 'optin', path: '/registro', visits: 1420, conversions: 498, aSplitVisits: 710, bSplitVisits: 710 },
        { id: 'step-2', name: 'Clase Maestra / VSL', type: 'sales', path: '/masterclass', visits: 498, conversions: 184, aSplitVisits: 250, bSplitVisits: 248 },
        { id: 'step-3', name: 'Agendamiento y Checkout', type: 'checkout', path: '/agendar-pago', visits: 184, conversions: 62, aSplitVisits: 92, bSplitVisits: 92 },
        { id: 'step-4', name: 'Confirmación y Bienvenida', type: 'thankyou', path: '/gracias', visits: 62, conversions: 62, aSplitVisits: 31, bSplitVisits: 31 }
      ],
      abTestingEnabled: true,
      splitPercentage: 50,
      aiSeo: {
        metaTitle: 'Masterclass: Escala tu Negocio con Automatización y Agentes IA | Luxora',
        metaDescription: 'Descubre el sistema todo en uno para captar prospectos, cerrar ventas en automático y atender en WhatsApp 24/7.',
        keywords: ['crm automatizado', 'embudos de venta', 'agentes de ia whatsapp', 'luxora digital'],
        author: 'Luxora Digital Team',
        ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
      },
      totalVisits: 2164,
      totalConversions: 498,
      totalRevenue: 28400,
      createdAt: '2026-09-20'
    },
    {
      id: 'funnel-2',
      name: 'Lanzamiento Programa Élite CRM & IA',
      domain: 'programa.luxoradigital.io',
      status: 'published',
      steps: [
        { id: 'step-21', name: 'Página de Captura VIP', type: 'optin', path: '/vip-optin', visits: 890, conversions: 312, aSplitVisits: 445, bSplitVisits: 445 },
        { id: 'step-22', name: 'Checkout Directo', type: 'checkout', path: '/orden', visits: 312, conversions: 45, aSplitVisits: 156, bSplitVisits: 156 },
        { id: 'step-23', name: 'Upsell de Implementación Rápida', type: 'upsell', path: '/acelerador', visits: 45, conversions: 18, aSplitVisits: 23, bSplitVisits: 22 },
        { id: 'step-24', name: 'Acceso a Campus', type: 'thankyou', path: '/acceso', visits: 45, conversions: 45, aSplitVisits: 23, bSplitVisits: 22 }
      ],
      abTestingEnabled: false,
      splitPercentage: 50,
      aiSeo: {
        metaTitle: 'Programa Élite de Ventas Digitales | Luxora',
        metaDescription: 'Capacitación intensiva para dominar la captación omnicanal.',
        keywords: ['curso crm', 'automatización de marketing', 'ventas b2b'],
        author: 'Luxora Academy',
        ogImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200'
      },
      totalVisits: 1292,
      totalConversions: 312,
      totalRevenue: 19800,
      createdAt: '2026-10-01'
    }
  ],
  forms: [
    {
      id: 'form-1',
      name: 'Formulario de Cualificación de Leads High-Ticket',
      fields: [
        { name: 'firstName', label: 'Nombre', type: 'text', required: true },
        { name: 'lastName', label: 'Apellido', type: 'text', required: true },
        { name: 'email', label: 'Correo Electrónico', type: 'email', required: true },
        { name: 'phone', label: 'Teléfono (con WhatsApp)', type: 'tel', required: true },
        { name: 'birthDate', label: 'Fecha de Nacimiento', type: 'date', required: false },
        { name: 'companyRevenue', label: 'Facturación Mensual Actual', type: 'select', required: true }
      ],
      hasPayment: false,
      submissionsCount: 428,
      createdAt: '2026-09-18'
    },
    {
      id: 'form-2',
      name: 'Formulario de Registro con Pago Integrado (Workshop VIP)',
      fields: [
        { name: 'fullName', label: 'Nombre Completo', type: 'text', required: true },
        { name: 'email', label: 'Email para Envío de Entrada', type: 'email', required: true },
        { name: 'phone', label: 'WhatsApp de Notificaciones', type: 'tel', required: true }
      ],
      hasPayment: true,
      productName: 'Pase VIP Workshop Automatizaciones & IA',
      productPrice: 197,
      submissionsCount: 84,
      createdAt: '2026-10-05'
    }
  ],
  surveys: [
    {
      id: 'survey-1',
      name: 'Cuestionario Diagnóstico: Madurez Digital y Ventas',
      questions: [
        {
          id: 'q-1',
          question: '¿Cuál es el volumen mensual de prospectos que recibe tu empresa?',
          type: 'multiple',
          options: [
            { label: 'Menos de 50 leads', score: 10 },
            { label: 'Entre 50 y 200 leads', score: 25 },
            { label: 'Entre 200 y 1000 leads', score: 40 },
            { label: 'Más de 1000 leads mensuales', score: 50 }
          ]
        },
        {
          id: 'q-2',
          question: '¿Cuánto tiempo tarda tu equipo en responder un nuevo mensaje en WhatsApp o Instagram?',
          type: 'multiple',
          options: [
            { label: 'Menos de 5 minutos (o usan IA)', score: 30 },
            { label: 'Entre 15 y 60 minutos', score: 20 },
            { label: 'Varias horas', score: 10 },
            { label: 'Al día siguiente o a veces se pierden', score: 0 }
          ]
        },
        {
          id: 'q-3',
          question: '¿Qué presupuesto mensual destinan a pauta publicitaria?',
          type: 'multiple',
          options: [
            { label: 'Menos de $500 USD', score: 5 },
            { label: '$500 a $2,000 USD', score: 15 },
            { label: 'Más de $2,000 USD', score: 30 }
          ]
        }
      ],
      qualificationThreshold: 60,
      submissionsCount: 231,
      createdAt: '2026-09-25'
    }
  ],
  sites: [
    {
      id: 'site-1',
      name: 'Sitio Web Corporativo Luxora Digital',
      type: 'website',
      domain: 'luxoradigital.io',
      pagesCount: 8,
      status: 'published',
      updatedAt: '2026-10-14'
    },
    {
      id: 'site-2',
      name: 'Tienda Oficial de Recursos y Plantillas',
      type: 'store',
      domain: 'tienda.luxoradigital.io',
      pagesCount: 14,
      status: 'published',
      itemsCount: 24,
      updatedAt: '2026-10-12'
    },
    {
      id: 'site-3',
      name: 'Blog de Estrategias y Novedades IA',
      type: 'blog',
      domain: 'blog.luxoradigital.io',
      pagesCount: 32,
      status: 'published',
      itemsCount: 32,
      updatedAt: '2026-10-15'
    }
  ],
  webinars: [
    {
      id: 'web-1',
      title: 'Lanzamiento: Cómo Implementar Agentes de IA en tu Empresa y Vender en Piloto Automático',
      host: 'Carlos Méndez (Fundador & Head of AI)',
      scheduledDate: '2026-10-22',
      scheduledTime: '19:00 CET',
      registeredCount: 685,
      liveRoomUrl: 'https://luxoradigital.io/en-vivo/masterclass-ia',
      status: 'scheduled'
    }
  ],
  portalUsers: [
    {
      id: 'pu-1',
      name: 'Elena Gómez',
      email: 'elena@vanguardiafitness.com',
      accessStatus: 'active',
      enrolledCourses: ['course-1', 'course-2'],
      lastLogin: '2026-10-15 14:22'
    },
    {
      id: 'pu-2',
      name: 'David Rivas',
      email: 'david@rivasconsulting.com',
      accessStatus: 'active',
      enrolledCourses: ['course-1'],
      lastLogin: '2026-10-13 18:05'
    }
  ],
  workflows: [
    {
      id: 'wf-1',
      name: 'Respuesta Inmediata Multicanal + Cualificación con IA',
      folder: 'Captación de Prospectos',
      status: 'active',
      triggerType: 'FORM_SUBMITTED',
      nodes: [
        {
          id: 'n-start',
          type: 'TRIGGER',
          title: 'Disparador: Formulario Enviado',
          description: 'Se activa cuando un lead completa el Formulario de Cualificación',
          config: { formId: 'form-1' },
          next: 'n-wa'
        },
        {
          id: 'n-wa',
          type: 'SEND_WHATSAPP',
          title: 'Enviar WhatsApp de Bienvenida',
          description: 'Envía mensaje personalizado con plantilla oficial de bienvenida',
          config: { message: '¡Hola {{firstName}}! Recibimos tu solicitud en Luxora Digital. Nuestro Asistente IA te atenderá ahora mismo.' },
          next: 'n-score'
        },
        {
          id: 'n-score',
          type: 'MODIFY_LEAD_SCORE',
          title: 'Aumentar Puntuación de Lead (+25)',
          description: 'Incrementa el lead score por completar el formulario',
          config: { increment: 25 },
          next: 'n-delay'
        },
        {
          id: 'n-delay',
          type: 'TIME_DELAY',
          title: 'Esperar 15 Minutos',
          description: 'Pausa para evaluar si el lead agendó llamada',
          config: { delayMinutes: 15 },
          next: 'n-condition'
        },
        {
          id: 'n-condition',
          type: 'IF_ELSE',
          title: 'Condicional: ¿Cita Agendada?',
          description: 'Verifica si el contacto ya tiene una cita registrada',
          config: { field: 'pipelineStageId', operator: 'equals', value: 'stage-3' },
          nextTrue: 'n-notify-team',
          nextFalse: 'n-email-reminder'
        },
        {
          id: 'n-notify-team',
          type: 'INTERNAL_NOTIFICATION',
          title: 'Notificar al Equipo Comercial',
          description: 'Alerta interna por Slack / Email sobre cita confirmada',
          config: { channel: 'commercial_leads', message: '¡Nuevo prospecto cualificado y con cita agendada: {{firstName}} {{lastName}}!' }
        },
        {
          id: 'n-email-reminder',
          type: 'SEND_EMAIL',
          title: 'Enviar Correo Recordatorio',
          description: 'Envía enlace directo a la agenda de reservas',
          config: { subject: '{{firstName}}, ¿a qué hora podemos llamarte?', body: 'Hola {{firstName}}, no olvides elegir tu horario aquí: https://luxora.digital/agendar' }
        }
      ],
      executionsCount: 384,
      updatedAt: '2026-10-15 17:30'
    },
    {
      id: 'wf-2',
      name: 'Autómata 24/7 para Respuestas a Llamadas Perdidas (Missed Call Text Back)',
      folder: 'Atención al Cliente',
      status: 'active',
      triggerType: 'MISSED_CALL',
      nodes: [
        {
          id: 'n-mc-trigger',
          type: 'TRIGGER',
          title: 'Disparador: Llamada Perdida Detectada',
          description: 'Detecta cuando entra una llamada al conmutador y no se responde',
          config: { trigger: 'missed_call' },
          next: 'n-mc-wa'
        },
        {
          id: 'n-mc-wa',
          type: 'SEND_WHATSAPP',
          title: 'WhatsApp Inmediato de Respaldo',
          description: 'Envía mensaje por WhatsApp en menos de 30 segundos',
          config: { message: '¡Hola! Vimos que nos llamaste pero estábamos en otra llamada. ¿En qué podemos ayudarte hoy? (Asistente Luxora IA)' },
          next: 'n-mc-assign'
        },
        {
          id: 'n-mc-assign',
          type: 'ASSIGN_USER',
          title: 'Asignar a Guardia Comercial',
          description: 'Asigna el contacto a Carlos Méndez para seguimiento prioritario',
          config: { userId: 'Carlos Méndez' }
        }
      ],
      executionsCount: 97,
      updatedAt: '2026-10-14 10:15'
    }
  ],
  transactions: [
    {
      id: 'tx-101',
      invoiceNumber: 'INV-2026-0891',
      contactName: 'Elena Gómez',
      contactEmail: 'elena@vanguardiafitness.com',
      amount: 3600,
      currency: 'USD',
      status: 'paid',
      gateway: 'stripe',
      date: '2026-10-14',
      items: [
        { description: 'Licencia Anual Luxora Digital Enterprise + Setup IA', quantity: 1, price: 3600 }
      ]
    },
    {
      id: 'tx-102',
      invoiceNumber: 'INV-2026-0892',
      contactName: 'Marcos Alarcón',
      contactEmail: 'marcos@alarcontech.com',
      amount: 197,
      currency: 'USD',
      status: 'paid',
      gateway: 'stripe',
      date: '2026-10-15',
      items: [
        { description: 'Workshop VIP: Automatización Multicanal', quantity: 1, price: 197 }
      ]
    },
    {
      id: 'tx-103',
      invoiceNumber: 'INV-2026-0893',
      contactName: 'Lucía Fernández',
      contactEmail: 'lucia@bloommarketing.es',
      amount: 297,
      currency: 'USD',
      status: 'paid',
      gateway: 'paypal',
      date: '2026-10-16',
      items: [
        { description: 'Suscripción Mensual Luxora Pro Hub', quantity: 1, price: 297 }
      ]
    }
  ],
  courses: [
    {
      id: 'course-1',
      title: 'Maestría en Automatización Comercial y Agentes IA',
      description: 'Aprende a diseñar embudos de alta conversión, conectar WhatsApp Cloud API e integrar agentes 24/7.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      price: 497,
      studentsCount: 142,
      modules: [
        {
          id: 'mod-1',
          title: 'Módulo 1: Fundamentos de la Plataforma Luxora All-in-One',
          lessons: [
            { id: 'les-1', title: 'Visión general del Launchpad y Dashboard', duration: '12 min' },
            { id: 'les-2', title: 'Configuración de pipelines y oportunidades', duration: '18 min' },
            { id: 'les-3', title: 'Gestión inteligente de contactos y etiquetas', duration: '15 min' }
          ]
        },
        {
          id: 'mod-2',
          title: 'Módulo 2: Agentes de Inteligencia Artificial 24/7',
          lessons: [
            { id: 'les-4', title: 'Conexión de proveedores (OpenAI, Gemini, Claude, Groq)', duration: '22 min' },
            { id: 'les-5', title: 'Ingeniería de prompts y base de conocimiento', duration: '26 min' },
            { id: 'les-6', title: 'Traspaso a humanos y gestión de objeciones', duration: '20 min' }
          ]
        }
      ]
    }
  ],
  emailCampaigns: [
    {
      id: 'camp-1',
      name: 'Boletín Semanal: Cómo duplicar tus conversiones con IA en WhatsApp',
      subject: '¿Tus leads esperan más de 10 minutos? Así los pierdes...',
      recipientsCount: 4210,
      openRate: 46.8,
      clickRate: 14.2,
      status: 'sent',
      sentAt: '2026-10-14 09:00'
    },
    {
      id: 'camp-2',
      name: 'Recordatorio Webinar VIP de Lanzamiento',
      subject: 'Faltan 24 horas: Descubre los nuevos Agentes de IA 24/7',
      recipientsCount: 685,
      openRate: 58.2,
      clickRate: 22.4,
      status: 'sent',
      sentAt: '2026-10-15 18:00'
    }
  ],
  media: [
    {
      id: 'med-1',
      name: 'luxora-hero-banner.jpg',
      type: 'image',
      size: '1.2 MB',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
      uploadedAt: '2026-10-10'
    },
    {
      id: 'med-2',
      name: 'demo-agente-ia-whatsapp.mp4',
      type: 'video',
      size: '24.8 MB',
      url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
      uploadedAt: '2026-10-12'
    },
    {
      id: 'med-3',
      name: 'guia-embudos-alta-conversion.pdf',
      type: 'document',
      size: '3.4 MB',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedAt: '2026-10-14'
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      platform: 'google',
      author: 'Guillermo Paz (CEO GrowthHub)',
      rating: 5,
      content: 'Tener CRM, embudos, WhatsApp con IA y pagos en un solo lugar nos ahorró más de $1,200 mensuales en herramientas separadas.',
      date: '2026-10-12',
      reply: '¡Muchísimas gracias Guillermo! Un placer impulsar a GrowthHub.'
    },
    {
      id: 'rev-2',
      platform: 'trustpilot',
      author: 'Carolina Navarro',
      rating: 5,
      content: 'El agente de IA 24/7 responde en segundos por WhatsApp e Instagram. Nuestras citas agendadas aumentaron un 300%.',
      date: '2026-10-14'
    }
  ]
};

// Database class
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading DB file, fallback to default seed:', err);
    }
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public save() {
    this.saveData(this.data);
  }
}

export const db = new Database();
