export type ActiveModule =
  // Module 1: CRM & Commercial
  | 'launchpad'
  | 'dashboard'
  | 'contacts'
  | 'pipelines'
  | 'social'
  | 'calendars'
  // Module 2: Sites & Funnels
  | 'funnels'
  | 'forms'
  | 'surveys'
  | 'sites'
  | 'webinars'
  | 'portal'
  | 'widget-qr'
  | 'site-analytics'
  // Module 3: Automation & AI
  | 'ai-agents'
  | 'workflows'
  // Module 4: Monetization & Admin
  | 'payments'
  | 'memberships'
  | 'marketing'
  | 'storage'
  | 'reputation'
  // Settings
  | 'integrations';

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
  opportunities?: Contact[];
  totalValue?: number;
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
  channelIdentifier: string;
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
  date: string;
  time: string;
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
  splitPercentage: number;
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
  itemsCount?: number;
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
  type: string;
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
