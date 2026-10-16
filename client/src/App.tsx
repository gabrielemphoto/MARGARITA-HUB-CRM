import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveModule,
  Contact,
  PipelineStage,
  Conversation,
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
import { api } from './api';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { IncomingSimulatorModal } from './components/IncomingSimulatorModal';
import { NewLeadModal } from './components/NewLeadModal';
import { ContactDetailDrawer } from './components/ContactDetailDrawer';

// Module Views
import { LaunchpadView } from './components/LaunchpadView';
import { DashboardView } from './components/DashboardView';
import { ContactsView } from './components/ContactsView';
import { PipelinesView } from './components/PipelinesView';
import { SocialInboxView } from './components/SocialInboxView';
import { CalendarsView } from './components/CalendarsView';

import { FunnelsView } from './components/FunnelsView';
import { FormsView } from './components/FormsView';
import { SurveysView } from './components/SurveysView';
import { SitesView } from './components/SitesView';
import { WebinarsView } from './components/WebinarsView';
import { ClientPortalView } from './components/ClientPortalView';
import { WidgetQrView } from './components/WidgetQrView';
import { SiteAnalyticsView } from './components/SiteAnalyticsView';

import { AIAgentsView } from './components/AIAgentsView';
import { WorkflowsView } from './components/WorkflowsView';

import { PaymentsView } from './components/PaymentsView';
import { MembershipsView } from './components/MembershipsView';
import { MarketingView } from './components/MarketingView';
import { StorageView } from './components/StorageView';
import { ReputationView } from './components/ReputationView';
import { IntegrationsView } from './components/IntegrationsView';

export function App() {
  const [currentModule, setCurrentModule] = useState<ActiveModule>('dashboard');

  // Server state
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [webinars, setWebinars] = useState<WebinarItem[]>([]);
  const [portalUsers, setPortalUsers] = useState<ClientPortalUser[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationSettings | null>(null);

  // Modals & Drawers
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [preselectedMessageContact, setPreselectedMessageContact] = useState<Contact | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      const [
        dash,
        cnts,
        pipes,
        convs,
        apps,
        fnls,
        frms,
        srvs,
        sts,
        wbns,
        ptl,
        wfs,
        txs,
        crs,
        cmps,
        med,
        revs,
        ai,
        ints
      ] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getContacts().catch(() => []),
        api.getPipelines().catch(() => ({ stages: [] })),
        api.getConversations().catch(() => []),
        api.getAppointments().catch(() => []),
        api.getFunnels().catch(() => []),
        api.getForms().catch(() => []),
        api.getSurveys().catch(() => []),
        api.getSites().catch(() => []),
        api.getWebinars().catch(() => []),
        api.getPortalUsers().catch(() => []),
        api.getWorkflows().catch(() => []),
        api.getTransactions().catch(() => []),
        api.getCourses().catch(() => []),
        api.getCampaigns().catch(() => []),
        api.getMedia().catch(() => []),
        api.getReviews().catch(() => []),
        api.getAISettings().catch(() => null),
        api.getIntegrations().catch(() => null)
      ]);

      if (dash) setDashboardData(dash);
      if (cnts) setContacts(cnts);
      if (pipes && pipes.stages) setStages(pipes.stages);
      if (convs) setConversations(convs);
      if (apps) setAppointments(apps);
      if (fnls) setFunnels(fnls);
      if (frms) setForms(frms);
      if (srvs) setSurveys(srvs);
      if (sts) setSites(sts);
      if (wbns) setWebinars(wbns);
      if (ptl) setPortalUsers(ptl);
      if (wfs) setWorkflows(wfs);
      if (txs) setTransactions(txs);
      if (crs) setCourses(crs);
      if (cmps) setCampaigns(cmps);
      if (med) setMedia(med);
      if (revs) setReviews(revs);
      if (ai) setAiSettings(ai);
      if (ints) setIntegrations(ints);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Real-time WebSocket connection to receive incoming messages & AI replies
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'MESSAGE_RECEIVED' || payload.type === 'AI_REPLY_SENT' || payload.type === 'MESSAGE_SENT') {
            fetchAllData();
          }
        } catch (e) {
          console.error(e);
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWs, 4000);
      };
    };

    connectWs();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [fetchAllData]);

  // Handle open direct message from Contact Drawer
  const handleOpenMessageFromContact = (contact: Contact) => {
    setSelectedContact(null);
    setPreselectedMessageContact(contact);
    setCurrentModule('social');
  };

  const unreadMessagesCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        aiSettings={aiSettings || undefined}
        integrations={integrations || undefined}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenNewLead={() => setIsNewLeadOpen(true)}
        onNavigate={setCurrentModule}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto overflow-hidden">
        {/* Categorized Sidebar */}
        <Sidebar
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          unreadMessagesCount={unreadMessagesCount}
        />

        {/* Dynamic Views Viewport */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {/* 1. GESTIÓN COMERCIAL Y CRM */}
          {currentModule === 'launchpad' && (
            <LaunchpadView
              integrations={integrations || undefined}
              aiSettings={aiSettings || undefined}
              onNavigate={setCurrentModule}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {currentModule === 'dashboard' && (
            <DashboardView
              data={dashboardData}
              onNavigate={setCurrentModule}
              onSelectContact={(c) => setSelectedContact(c)}
            />
          )}

          {currentModule === 'contacts' && (
            <ContactsView
              contacts={contacts}
              stages={stages}
              onSelectContact={(c) => setSelectedContact(c)}
              onOpenNewLead={() => setIsNewLeadOpen(true)}
              onOpenMessage={handleOpenMessageFromContact}
            />
          )}

          {currentModule === 'pipelines' && (
            <PipelinesView
              stages={stages}
              contacts={contacts}
              onSelectContact={(c) => setSelectedContact(c)}
              onOpenNewLead={() => setIsNewLeadOpen(true)}
              onRefresh={fetchAllData}
            />
          )}

          {currentModule === 'social' && (
            <SocialInboxView
              conversations={conversations}
              contacts={contacts}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onRefresh={fetchAllData}
              preselectedContact={preselectedMessageContact}
            />
          )}

          {currentModule === 'calendars' && (
            <CalendarsView
              appointments={appointments}
              contacts={contacts}
              onRefresh={fetchAllData}
            />
          )}

          {/* 2. CREACIÓN DE SITIOS, EMBUDOS Y CAPTACIÓN */}
          {currentModule === 'funnels' && (
            <FunnelsView
              funnels={funnels}
              onRefresh={fetchAllData}
            />
          )}

          {currentModule === 'forms' && (
            <FormsView
              forms={forms}
              onRefresh={fetchAllData}
            />
          )}

          {currentModule === 'surveys' && (
            <SurveysView
              surveys={surveys}
              onRefresh={fetchAllData}
            />
          )}

          {currentModule === 'sites' && (
            <SitesView
              sites={sites}
            />
          )}

          {currentModule === 'webinars' && (
            <WebinarsView
              webinars={webinars}
            />
          )}

          {currentModule === 'portal' && (
            <ClientPortalView
              portalUsers={portalUsers}
            />
          )}

          {currentModule === 'widget-qr' && (
            <WidgetQrView />
          )}

          {currentModule === 'site-analytics' && (
            <SiteAnalyticsView />
          )}

          {/* 3. AUTOMATIZACIÓN Y AGENTES DE AI */}
          {currentModule === 'ai-agents' && aiSettings && (
            <AIAgentsView
              aiSettings={aiSettings}
              onRefresh={fetchAllData}
            />
          )}

          {currentModule === 'workflows' && (
            <WorkflowsView
              workflows={workflows}
              onRefresh={fetchAllData}
            />
          )}

          {/* 4. MONETIZACIÓN, FORMACIÓN Y ADMINISTRACIÓN */}
          {currentModule === 'payments' && (
            <PaymentsView
              transactions={transactions}
            />
          )}

          {currentModule === 'memberships' && (
            <MembershipsView
              courses={courses}
            />
          )}

          {currentModule === 'marketing' && (
            <MarketingView
              campaigns={campaigns}
            />
          )}

          {currentModule === 'storage' && (
            <StorageView
              media={media}
            />
          )}

          {currentModule === 'reputation' && (
            <ReputationView
              reviews={reviews}
              onRefresh={fetchAllData}
            />
          )}

          {/* SISTEMA E INTEGRACIONES */}
          {currentModule === 'integrations' && integrations && (
            <IntegrationsView
              integrations={integrations}
              onRefresh={fetchAllData}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <IncomingSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onMessageSent={() => fetchAllData()}
      />

      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onLeadCreated={() => fetchAllData()}
      />

      <ContactDetailDrawer
        contact={selectedContact}
        stages={stages}
        onClose={() => setSelectedContact(null)}
        onUpdate={() => {
          fetchAllData();
          if (selectedContact) {
            const updated = contacts.find(c => c.id === selectedContact.id);
            if (updated) setSelectedContact(updated);
          }
        }}
        onOpenMessage={handleOpenMessageFromContact}
      />
    </div>
  );
}

export default App;
