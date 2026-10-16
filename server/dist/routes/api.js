import { Router } from 'express';
import { db } from '../db.js';
import { aiService } from '../services/aiService.js';
import { multichannelService } from '../services/multichannelService.js';
import { workflowEngine } from '../services/workflowEngine.js';
import { v4 as uuidv4 } from 'uuid';
export const apiRouter = Router();
// ==========================================
// 1. DASHBOARD & ANALYTICS
// ==========================================
apiRouter.get('/dashboard', (req, res) => {
    const data = db.get();
    const totalContacts = data.contacts.length;
    const pipelineValue = data.contacts.reduce((acc, c) => acc + (c.opportunityValue || 0), 0);
    const wonContacts = data.contacts.filter(c => c.pipelineStageId === 'stage-5');
    const wonValue = wonContacts.reduce((acc, c) => acc + (c.opportunityValue || 0), 0);
    const conversionRate = totalContacts > 0 ? ((wonContacts.length / totalContacts) * 100).toFixed(1) : '0';
    // Funnel analytics summary
    const funnelsData = data.funnels.map(f => ({
        name: f.name,
        visits: f.totalVisits,
        conversions: f.totalConversions,
        revenue: f.totalRevenue,
        rate: f.totalVisits > 0 ? ((f.totalConversions / f.totalVisits) * 100).toFixed(1) : '0'
    }));
    // Stage distribution
    const stageDistribution = data.stages.map(st => {
        const contactsInStage = data.contacts.filter(c => c.pipelineStageId === st.id);
        return {
            id: st.id,
            name: st.name,
            color: st.color,
            count: contactsInStage.length,
            value: contactsInStage.reduce((acc, c) => acc + (c.opportunityValue || 0), 0)
        };
    });
    // Multichannel messages count
    const channelStats = {
        whatsapp: data.conversations.filter(c => c.channel === 'whatsapp').length,
        instagram: data.conversations.filter(c => c.channel === 'instagram').length,
        facebook: data.conversations.filter(c => c.channel === 'facebook').length,
        email: data.conversations.filter(c => c.channel === 'email').length,
        webchat: data.conversations.filter(c => c.channel === 'webchat').length
    };
    res.json({
        kpis: {
            totalOpportunities: totalContacts,
            pipelineValue,
            conversionRate: `${conversionRate}%`,
            wonRevenue: wonValue,
            activeAIInteractions: data.conversations.filter(c => c.aiAutoPilot).length
        },
        stageDistribution,
        funnelsData,
        channelStats,
        recentActivity: data.contacts.slice(0, 5).map(c => ({
            contact: `${c.firstName} ${c.lastName}`,
            company: c.company,
            activity: c.lastActivity,
            leadScore: c.leadScore,
            value: c.opportunityValue,
            stage: data.stages.find(s => s.id === c.pipelineStageId)?.name || 'Lead'
        }))
    });
});
// ==========================================
// 2. CONTACTS & SMART LISTS
// ==========================================
apiRouter.get('/contacts', (req, res) => {
    const { search, tag, stage } = req.query;
    let contacts = db.get().contacts;
    if (search) {
        const q = String(search).toLowerCase();
        contacts = contacts.filter(c => c.firstName.toLowerCase().includes(q) ||
            c.lastName.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.phone.includes(q));
    }
    if (tag) {
        contacts = contacts.filter(c => c.tags.includes(String(tag)));
    }
    if (stage) {
        contacts = contacts.filter(c => c.pipelineStageId === String(stage));
    }
    res.json(contacts);
});
apiRouter.post('/contacts', (req, res) => {
    const data = db.get();
    const newContact = {
        id: `c-${uuidv4().slice(0, 8)}`,
        firstName: req.body.firstName || 'Nuevo',
        lastName: req.body.lastName || 'Contacto',
        email: req.body.email || '',
        phone: req.body.phone || '',
        company: req.body.company || '',
        tags: req.body.tags || ['Nuevo Prospecto'],
        smartList: req.body.smartList || 'General',
        pipelineStageId: req.body.pipelineStageId || 'stage-1',
        opportunityValue: Number(req.body.opportunityValue) || 1000,
        leadScore: Number(req.body.leadScore) || 50,
        birthDate: req.body.birthDate,
        assignedTo: req.body.assignedTo || 'Carlos Méndez',
        notes: [],
        tasks: [],
        createdAt: new Date().toISOString().slice(0, 10),
        lastActivity: 'Recién creado',
        aiAutoPilot: req.body.aiAutoPilot !== false
    };
    data.contacts.unshift(newContact);
    db.save();
    // Trigger workflow for contact created
    workflowEngine.trigger('TAG_ADDED', { contact: newContact });
    res.json(newContact);
});
apiRouter.put('/contacts/:id', (req, res) => {
    const data = db.get();
    const contact = data.contacts.find(c => c.id === req.params.id);
    if (!contact)
        return res.status(404).json({ error: 'Contact not found' });
    Object.assign(contact, req.body, { lastActivity: 'Actualizado' });
    db.save();
    res.json(contact);
});
apiRouter.delete('/contacts/:id', (req, res) => {
    const data = db.get();
    data.contacts = data.contacts.filter(c => c.id !== req.params.id);
    data.conversations = data.conversations.filter(c => c.contactId !== req.params.id);
    db.save();
    res.json({ success: true });
});
apiRouter.post('/contacts/:id/notes', (req, res) => {
    const data = db.get();
    const contact = data.contacts.find(c => c.id === req.params.id);
    if (!contact)
        return res.status(404).json({ error: 'Contact not found' });
    const note = {
        id: `n-${Date.now()}`,
        text: req.body.text,
        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        author: req.body.author || 'Asesor Luxora'
    };
    contact.notes.unshift(note);
    db.save();
    res.json(note);
});
apiRouter.post('/contacts/:id/tasks', (req, res) => {
    const data = db.get();
    const contact = data.contacts.find(c => c.id === req.params.id);
    if (!contact)
        return res.status(404).json({ error: 'Contact not found' });
    const task = {
        id: `t-${Date.now()}`,
        title: req.body.title,
        dueDate: req.body.dueDate || new Date().toISOString().slice(0, 10),
        completed: false
    };
    contact.tasks.push(task);
    db.save();
    res.json(task);
});
// ==========================================
// 3. PIPELINES (OPPORTUNITIES KANBAN)
// ==========================================
apiRouter.get('/pipelines', (req, res) => {
    const data = db.get();
    const pipeline = data.stages.map(stage => {
        const stageContacts = data.contacts.filter(c => c.pipelineStageId === stage.id);
        return {
            ...stage,
            opportunities: stageContacts,
            totalValue: stageContacts.reduce((sum, c) => sum + (c.opportunityValue || 0), 0)
        };
    });
    res.json({ stages: pipeline });
});
apiRouter.put('/contacts/:id/stage', (req, res) => {
    const { stageId } = req.body;
    const data = db.get();
    const contact = data.contacts.find(c => c.id === req.params.id);
    if (!contact)
        return res.status(404).json({ error: 'Contact not found' });
    contact.pipelineStageId = stageId;
    contact.lastActivity = 'Cambio de etapa en pipeline';
    db.save();
    // Trigger workflows listening to stage update
    workflowEngine.trigger('PIPELINE_STAGE_CHANGED', { contact, stageId });
    res.json({ success: true, contact });
});
// ==========================================
// 4. SOCIAL (OMNI-INBOX & COMMUNICATIONS)
// ==========================================
apiRouter.get('/conversations', (req, res) => {
    const conversations = db.get().conversations;
    res.json(conversations);
});
apiRouter.get('/conversations/:id/messages', (req, res) => {
    const messages = db.get().messages.filter(m => m.conversationId === req.params.id);
    // Mark messages as read
    const conv = db.get().conversations.find(c => c.id === req.params.id);
    if (conv) {
        conv.unreadCount = 0;
        messages.forEach(m => { m.read = true; });
        db.save();
    }
    res.json(messages);
});
apiRouter.post('/conversations/:id/messages', async (req, res) => {
    try {
        const { text, agentName, mediaUrl } = req.body;
        const message = await multichannelService.sendManualMessage({
            conversationId: req.params.id,
            text,
            agentName: agentName || 'Asesor Luxora',
            mediaUrl
        });
        res.json(message);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.put('/conversations/:id/autopilot', (req, res) => {
    const { enabled } = req.body;
    const conv = db.get().conversations.find(c => c.id === req.params.id);
    if (!conv)
        return res.status(404).json({ error: 'Conversation not found' });
    conv.aiAutoPilot = Boolean(enabled);
    db.save();
    res.json({ success: true, aiAutoPilot: conv.aiAutoPilot });
});
// Incoming message simulator / webhook endpoint
apiRouter.post('/webhooks/incoming', async (req, res) => {
    try {
        const { channel, senderId, senderName, text } = req.body;
        const result = await multichannelService.handleIncomingMessage({
            channel: channel || 'whatsapp',
            senderId: senderId || '+34 612 000 111',
            senderName: senderName || 'Lead Interesado',
            text: text || 'Hola, quiero información de los servicios.'
        });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 5. CALENDARS & APPOINTMENTS
// ==========================================
apiRouter.get('/appointments', (req, res) => {
    res.json(db.get().appointments);
});
apiRouter.post('/appointments', (req, res) => {
    const data = db.get();
    const newApp = {
        id: `app-${Date.now()}`,
        title: req.body.title || 'Sesión de Asesoría Luxora',
        contactId: req.body.contactId || '',
        contactName: req.body.contactName || 'Prospecto',
        contactEmail: req.body.contactEmail || '',
        contactPhone: req.body.contactPhone || '',
        serviceType: req.body.serviceType || 'Reunión Comercial',
        date: req.body.date || new Date().toISOString().slice(0, 10),
        time: req.body.time || '10:00',
        durationMinutes: Number(req.body.durationMinutes) || 30,
        status: req.body.status || 'confirmed',
        notes: req.body.notes || ''
    };
    data.appointments.push(newApp);
    // Link or update contact stage to 'Cita Agendada' (stage-3)
    const contact = data.contacts.find(c => c.id === newApp.contactId || c.email === newApp.contactEmail);
    if (contact) {
        contact.pipelineStageId = 'stage-3';
        contact.lastActivity = `Cita agendada para el ${newApp.date} a las ${newApp.time}`;
        workflowEngine.trigger('APPOINTMENT_BOOKED', { contact, appointment: newApp });
    }
    db.save();
    res.json(newApp);
});
apiRouter.delete('/appointments/:id', (req, res) => {
    const data = db.get();
    data.appointments = data.appointments.filter(a => a.id !== req.params.id);
    db.save();
    res.json({ success: true });
});
// ==========================================
// 6. FUNNELS & A/B TESTING
// ==========================================
apiRouter.get('/funnels', (req, res) => {
    res.json(db.get().funnels);
});
apiRouter.post('/funnels', (req, res) => {
    const data = db.get();
    const newFunnel = {
        id: `funnel-${Date.now()}`,
        name: req.body.name || 'Nuevo Embudo de Venta',
        domain: req.body.domain || 'embudo.luxoradigital.io',
        status: 'draft',
        steps: req.body.steps || [
            { id: `step-${Date.now()}-1`, name: 'Página de Captura (Optin)', type: 'optin', path: '/registro', visits: 0, conversions: 0, aSplitVisits: 0, bSplitVisits: 0 },
            { id: `step-${Date.now()}-2`, name: 'Página de Agradecimiento', type: 'thankyou', path: '/gracias', visits: 0, conversions: 0, aSplitVisits: 0, bSplitVisits: 0 }
        ],
        abTestingEnabled: req.body.abTestingEnabled || false,
        splitPercentage: req.body.splitPercentage || 50,
        aiSeo: req.body.aiSeo || {
            metaTitle: req.body.name,
            metaDescription: 'Embudo de conversión diseñado en Luxora Digital',
            keywords: ['embudos', 'leads'],
            author: 'Luxora Digital',
            ogImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200'
        },
        totalVisits: 0,
        totalConversions: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString().slice(0, 10)
    };
    data.funnels.push(newFunnel);
    db.save();
    res.json(newFunnel);
});
apiRouter.put('/funnels/:id', (req, res) => {
    const data = db.get();
    const funnel = data.funnels.find(f => f.id === req.params.id);
    if (!funnel)
        return res.status(404).json({ error: 'Funnel not found' });
    Object.assign(funnel, req.body);
    db.save();
    res.json(funnel);
});
// ==========================================
// 7. FORMS & SURVEYS
// ==========================================
apiRouter.get('/forms', (req, res) => {
    res.json(db.get().forms);
});
apiRouter.post('/forms', (req, res) => {
    const data = db.get();
    const newForm = {
        id: `form-${Date.now()}`,
        name: req.body.name || 'Formulario de Captación',
        fields: req.body.fields || [
            { name: 'name', label: 'Nombre Completo', type: 'text', required: true },
            { name: 'email', label: 'Correo Electrónico', type: 'email', required: true },
            { name: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', required: true }
        ],
        hasPayment: Boolean(req.body.hasPayment),
        productName: req.body.productName,
        productPrice: Number(req.body.productPrice) || 0,
        submissionsCount: 0,
        createdAt: new Date().toISOString().slice(0, 10)
    };
    data.forms.push(newForm);
    db.save();
    res.json(newForm);
});
apiRouter.post('/forms/:id/submit', async (req, res) => {
    const data = db.get();
    const form = data.forms.find(f => f.id === req.params.id);
    if (!form)
        return res.status(404).json({ error: 'Form not found' });
    form.submissionsCount += 1;
    // Process contact
    const { firstName, lastName, fullName, email, phone, ...extra } = req.body;
    const nameParts = fullName ? fullName.split(' ') : [];
    const contact = {
        id: `c-${uuidv4().slice(0, 8)}`,
        firstName: firstName || nameParts[0] || 'Prospecto',
        lastName: lastName || nameParts.slice(1).join(' ') || 'Formulario',
        email: email || `lead_${Date.now()}@luxora.leads`,
        phone: phone || '+1 (555) 123-4567',
        company: req.body.company || 'Empresa Prospecto',
        tags: [`Formulario: ${form.name}`],
        smartList: 'Leads de Formularios',
        pipelineStageId: 'stage-1',
        opportunityValue: form.hasPayment && form.productPrice ? form.productPrice : 1500,
        leadScore: 60,
        assignedTo: 'Carlos Méndez',
        notes: [{
                id: `n-${Date.now()}`,
                text: `Envió formulario "${form.name}". Datos: ${JSON.stringify(extra)}`,
                createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                author: 'Sistema de Formularios'
            }],
        tasks: [],
        createdAt: new Date().toISOString().slice(0, 10),
        lastActivity: 'Envío de formulario',
        aiAutoPilot: true
    };
    data.contacts.unshift(contact);
    db.save();
    // Trigger workflows
    workflowEngine.trigger('FORM_SUBMITTED', { contact, formId: form.id });
    res.json({ success: true, contact });
});
apiRouter.get('/surveys', (req, res) => {
    res.json(db.get().surveys);
});
apiRouter.post('/surveys', (req, res) => {
    const data = db.get();
    const newSurvey = {
        id: `survey-${Date.now()}`,
        name: req.body.name || 'Encuesta de Calificación Comercial',
        questions: req.body.questions || [],
        qualificationThreshold: Number(req.body.qualificationThreshold) || 60,
        submissionsCount: 0,
        createdAt: new Date().toISOString().slice(0, 10)
    };
    data.surveys.push(newSurvey);
    db.save();
    res.json(newSurvey);
});
apiRouter.post('/surveys/:id/submit', (req, res) => {
    const data = db.get();
    const survey = data.surveys.find(s => s.id === req.params.id);
    if (!survey)
        return res.status(404).json({ error: 'Survey not found' });
    survey.submissionsCount += 1;
    const { score, answers, email, name } = req.body;
    const qualified = Number(score) >= survey.qualificationThreshold;
    db.save();
    res.json({ success: true, qualified, score });
});
// ==========================================
// 8. SITES, WEBINARS & CLIENT PORTAL
// ==========================================
apiRouter.get('/sites', (req, res) => res.json(db.get().sites));
apiRouter.get('/webinars', (req, res) => res.json(db.get().webinars));
apiRouter.get('/portal/users', (req, res) => res.json(db.get().portalUsers));
// ==========================================
// 9. WORKFLOWS & AI AUTOMATIONS
// ==========================================
apiRouter.get('/workflows', (req, res) => {
    res.json(db.get().workflows);
});
apiRouter.post('/workflows', (req, res) => {
    const data = db.get();
    const newWf = {
        id: `wf-${Date.now()}`,
        name: req.body.name || 'Nueva Automatización',
        folder: req.body.folder || 'General',
        status: req.body.status || 'draft',
        triggerType: req.body.triggerType || 'FORM_SUBMITTED',
        nodes: req.body.nodes || [],
        executionsCount: 0,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    data.workflows.push(newWf);
    db.save();
    res.json(newWf);
});
apiRouter.put('/workflows/:id', (req, res) => {
    const data = db.get();
    const wf = data.workflows.find(w => w.id === req.params.id);
    if (!wf)
        return res.status(404).json({ error: 'Workflow not found' });
    Object.assign(wf, req.body, { updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    db.save();
    res.json(wf);
});
apiRouter.post('/workflows/ai-generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt)
            return res.status(400).json({ error: 'Prompt is required' });
        const generated = await aiService.generateWorkflowFromPrompt(prompt);
        res.json(generated);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 10. AI CONFIGURATION & MULTI-PROVIDER AGENT
// ==========================================
apiRouter.get('/ai/settings', (req, res) => {
    res.json(db.get().aiSettings);
});
apiRouter.put('/ai/settings', (req, res) => {
    const data = db.get();
    Object.assign(data.aiSettings, req.body);
    db.save();
    res.json(data.aiSettings);
});
apiRouter.post('/ai/test', async (req, res) => {
    try {
        const { message } = req.body;
        const result = await aiService.generateChatReply({
            channel: 'webchat',
            incomingMessage: message || 'Hola, ¿qué servicios ofrecen y cuáles son sus precios?',
            history: []
        });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.post('/ai/assist', async (req, res) => {
    try {
        const { instruction, contextText, tone } = req.body;
        const drafted = await aiService.assistDraft({ instruction, contextText, tone });
        res.json({ draft: drafted });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
apiRouter.post('/ai/seo', async (req, res) => {
    try {
        const { pageTitle, businessType, targetAudience } = req.body;
        const seo = await aiService.generateSeoMetadata({ pageTitle, businessType, targetAudience });
        res.json(seo);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// ==========================================
// 11. MONETIZATION, LMS, MARKETING, MEDIA & REPUTATION
// ==========================================
apiRouter.get('/payments/transactions', (req, res) => res.json(db.get().transactions));
apiRouter.get('/memberships/courses', (req, res) => res.json(db.get().courses));
apiRouter.get('/marketing/campaigns', (req, res) => res.json(db.get().emailCampaigns));
apiRouter.get('/media', (req, res) => res.json(db.get().media));
apiRouter.get('/reviews', (req, res) => res.json(db.get().reviews));
apiRouter.post('/reviews/:id/reply', (req, res) => {
    const data = db.get();
    const review = data.reviews.find(r => r.id === req.params.id);
    if (!review)
        return res.status(404).json({ error: 'Review not found' });
    review.reply = req.body.reply;
    db.save();
    res.json(review);
});
// ==========================================
// 12. INTEGRATION SETTINGS
// ==========================================
apiRouter.get('/integrations', (req, res) => {
    res.json(db.get().integrations);
});
apiRouter.put('/integrations/:platform', (req, res) => {
    const data = db.get();
    const platform = req.params.platform;
    if (!data.integrations[platform])
        return res.status(404).json({ error: 'Platform not found' });
    Object.assign(data.integrations[platform], req.body);
    db.save();
    res.json(data.integrations[platform]);
});
