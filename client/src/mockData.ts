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
  Transaction,
  Course,
  EmailCampaign,
  MediaFile,
  ReviewItem,
  AISettings,
  IntegrationSettings
} from './types';

export const initialAiSettings: AISettings = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  baseUrl: 'https://api.openai.com/v1',
  systemPrompt: `Eres Margarita AI Assistant, el asistente comercial inteligente 24/7 de MARGARITA HUB CRM.
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
    companyName: 'MARGARITA HUB CRM',
    services: 'Plataforma CRM All-in-One, Embudos de Venta, Marketing Multicanal y Agentes de IA 24/7',
    pricing: 'Planes desde $97/mes (Starter) hasta $297/mes (Enterprise Pro)',
    bookingUrl: 'https://margaritahub.com/agendar-llamada',
    supportEmail: 'contacto@margaritahub.com',
    operatingHours: 'Atención 24/7 con Agentes de Inteligencia Artificial'
  }
};

export const initialIntegrations: IntegrationSettings = {
  whatsapp: {
    enabled: false,
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    verifyToken: 'margarita_verify_token_2026',
    status: 'disconnected'
  },
  instagram: {
    enabled: false,
    pageId: '',
    igUserId: '',
    accessToken: '',
    verifyToken: 'margarita_ig_webhook_2026',
    status: 'disconnected'
  },
  facebook: {
    enabled: false,
    pageId: '',
    accessToken: '',
    verifyToken: 'margarita_fb_webhook_2026',
    status: 'disconnected'
  },
  email: {
    enabled: false,
    provider: 'resend',
    smtpHost: 'smtp.resend.com',
    smtpPort: 465,
    smtpUser: '',
    smtpPass: '',
    fromEmail: 'contacto@margaritahub.com',
    fromName: 'MARGARITA HUB CRM Suite',
    status: 'disconnected'
  },
  stripe: {
    enabled: false,
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    status: 'disconnected'
  },
  shopify: {
    enabled: false,
    shopDomain: '',
    accessToken: '',
    status: 'disconnected'
  },
  airtable: {
    enabled: false,
    apiKey: '',
    baseId: '',
    status: 'disconnected'
  },
  asana: {
    enabled: false,
    accessToken: '',
    workspaceId: '',
    status: 'disconnected'
  },
  whatsappSession: {
    connected: false,
    phoneNumber: '+58 412 359 0065',
    method: 'pairing_code'
  },
  instagramSession: {
    connected: false,
    username: ''
  }
};

export const initialStages: PipelineStage[] = [
  { id: 'stage-1', name: 'Lead Nuevo', color: '#3b82f6', order: 1 },
  { id: 'stage-2', name: 'Contactado / Calificado', color: '#eab308', order: 2 },
  { id: 'stage-3', name: 'Cita Agendada', color: '#8b5cf6', order: 3 },
  { id: 'stage-4', name: 'Propuesta Enviada', color: '#f97316', order: 4 },
  { id: 'stage-5', name: 'Ganado (Vendido)', color: '#10b981', order: 5 },
  { id: 'stage-6', name: 'Perdido', color: '#ef4444', order: 6 }
];

export const initialPipelines: Pipeline[] = [
  {
    id: 'pipe-sales',
    name: 'Pipeline Principal de Ventas',
    description: 'Ciclo completo de prospección, demo y cierre de clientes',
    isDefault: true,
    stages: initialStages
  },
  {
    id: 'pipe-high-ticket',
    name: 'Pipeline Clientes High-Ticket ($3k - $10k)',
    description: 'Embudos avanzados y consultoría corporativa personalizada',
    isDefault: false,
    stages: [
      { id: 'ht-1', name: 'Postulación Recibida', color: '#6366f1', order: 1 },
      { id: 'ht-2', name: 'Filtro de Cualificación IA', color: '#3b82f6', order: 2 },
      { id: 'ht-3', name: 'Llamada de Estrategia Agendada', color: '#8b5cf6', order: 3 },
      { id: 'ht-4', name: 'Propuesta de Alto Valor Presentada', color: '#f59e0b', order: 4 },
      { id: 'ht-5', name: 'Contrato Firmado / Cobro Exitoso', color: '#10b981', order: 5 }
    ]
  },
  {
    id: 'pipe-support',
    name: 'Pipeline Éxito & Onboarding de Clientes',
    description: 'Acompañamiento post-venta y renovación',
    isDefault: false,
    stages: [
      { id: 'ob-1', name: 'Nuevo Cliente Bienvenido', color: '#06b6d4', order: 1 },
      { id: 'ob-2', name: 'Configuración de WhatsApp & IA Lista', color: '#3b82f6', order: 2 },
      { id: 'ob-3', name: 'Capacitación del Equipo', color: '#a855f7', order: 3 },
      { id: 'ob-4', name: 'Caso de Éxito / Renovación', color: '#10b981', order: 4 }
    ]
  }
];

export const initialContacts: Contact[] = [];

export const initialConversations: Conversation[] = [];

export const initialMessages: ConversationMessage[] = [];

export const initialAppointments: Appointment[] = [];

export const initialFunnels: Funnel[] = [
  {
    id: 'funnel-1',
    name: 'Embudo Maestro - Captación High-Ticket',
    domain: 'oferta.margaritahub.com',
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
      metaTitle: 'Masterclass: Escala tu Negocio con Automatización y Agentes IA | Margarita Hub',
      metaDescription: 'Descubre el sistema todo en uno para captar prospectos, cerrar ventas en automático y atender en WhatsApp 24/7.',
      keywords: ['crm automatizado', 'embudos de venta', 'agentes de ia whatsapp', 'margarita hub crm'],
      author: 'Margarita Hub Team',
      ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
    },
    totalVisits: 2164,
    totalConversions: 498,
    totalRevenue: 28400,
    createdAt: '2026-09-20'
  }
];

export const initialForms: FormItem[] = [
  {
    id: 'form-1',
    name: 'Formulario de Cualificación de Leads High-Ticket',
    fields: [
      { name: 'firstName', label: 'Nombre', type: 'text', required: true },
      { name: 'lastName', label: 'Apellido', type: 'text', required: true },
      { name: 'email', label: 'Correo Electrónico', type: 'email', required: true },
      { name: 'phone', label: 'Teléfono (con WhatsApp)', type: 'tel', required: true }
    ],
    hasPayment: false,
    submissionsCount: 428,
    createdAt: '2026-09-18'
  }
];

export const initialSurveys: SurveyItem[] = [
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
      }
    ],
    qualificationThreshold: 50,
    submissionsCount: 231,
    createdAt: '2026-09-25'
  }
];

export const initialSites: SiteItem[] = [
  {
    id: 'site-1',
    name: 'Sitio Web Corporativo Margarita Hub',
    type: 'website',
    domain: 'margaritahub.com',
    pagesCount: 8,
    status: 'published',
    updatedAt: '2026-10-14'
  },
  {
    id: 'site-2',
    name: 'Tienda Oficial de Recursos y Plantillas',
    type: 'store',
    domain: 'tienda.margaritahub.com',
    pagesCount: 14,
    status: 'published',
    itemsCount: 24,
    updatedAt: '2026-10-12'
  }
];

export const initialWebinars: WebinarItem[] = [
  {
    id: 'web-1',
    title: 'Lanzamiento: Cómo Implementar Agentes de IA en tu Empresa y Vender en Piloto Automático',
    host: 'Equipo Margarita Hub CRM',
    scheduledDate: '2026-10-22',
    scheduledTime: '19:00 CET',
    registeredCount: 685,
    liveRoomUrl: 'https://margaritahub.com/en-vivo/masterclass-ia',
    status: 'scheduled'
  }
];

export const initialPortalUsers: ClientPortalUser[] = [];

export const initialWorkflows: Workflow[] = [
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
        config: { message: '¡Hola {{firstName}}! Recibimos tu solicitud en MARGARITA HUB CRM. Nuestro Asistente IA te atenderá ahora mismo.' },
        next: 'n-score'
      },
      {
        id: 'n-score',
        type: 'MODIFY_LEAD_SCORE',
        title: 'Aumentar Puntuación de Lead (+25)',
        description: 'Incrementa el lead score por completar el formulario',
        config: { increment: 25 }
      }
    ],
    executionsCount: 0,
    updatedAt: '2026-10-15'
  }
];

export const initialTransactions: Transaction[] = [];

export const initialCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Maestría en Automatización Comercial y Agentes IA',
    description: 'Aprende a diseñar embudos de alta conversión, conectar WhatsApp Cloud API e integrar agentes 24/7.',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
    price: 497,
    studentsCount: 0,
    modules: [
      {
        id: 'mod-1',
        title: 'Módulo 1: Fundamentos de MARGARITA HUB CRM',
        lessons: [
          { id: 'les-1', title: 'Visión general del Launchpad y Dashboard', duration: '12 min' },
          { id: 'les-2', title: 'Configuración de pipelines y oportunidades', duration: '18 min' }
        ]
      }
    ]
  }
];

export const initialCampaigns: EmailCampaign[] = [];

export const initialMedia: MediaFile[] = [];

export const initialReviews: ReviewItem[] = [];

