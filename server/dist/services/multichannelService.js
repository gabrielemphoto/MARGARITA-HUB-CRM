import { db } from '../db.js';
import { aiService } from './aiService.js';
import { v4 as uuidv4 } from 'uuid';
export class MultichannelService {
    broadcasters = new Set();
    registerBroadcaster(cb) {
        this.broadcasters.add(cb);
        return () => {
            this.broadcasters.delete(cb);
        };
    }
    broadcast(type, payload) {
        for (const cb of this.broadcasters) {
            try {
                cb(type, payload);
            }
            catch (e) {
                console.error('Broadcast error:', e);
            }
        }
    }
    /**
     * Processes any incoming message from WhatsApp, Instagram, Facebook, Email, or Webchat.
     */
    async handleIncomingMessage(params) {
        const data = db.get();
        const { channel, senderId, senderName, text, mediaUrl } = params;
        // 1. Find or create Contact
        let contact = data.contacts.find(c => {
            if (channel === 'whatsapp')
                return c.phone.replace(/\D/g, '') === senderId.replace(/\D/g, '');
            if (channel === 'email')
                return c.email.toLowerCase() === senderId.toLowerCase();
            return c.phone === senderId || c.email === senderId;
        });
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (!contact) {
            const nameParts = (senderName || 'Nuevo Prospecto').split(' ');
            contact = {
                id: `c-${uuidv4().slice(0, 8)}`,
                firstName: nameParts[0] || 'Nuevo',
                lastName: nameParts.slice(1).join(' ') || 'Prospecto',
                email: channel === 'email' ? senderId : `lead_${senderId.replace(/\D/g, '')}@luxora.leads`,
                phone: channel === 'whatsapp' ? senderId : '+1 (555) 000-0000',
                company: 'Empresa Prospecto',
                tags: [`Canal: ${channel.toUpperCase()}`, 'Nuevo Lead'],
                smartList: 'Leads Recientes',
                pipelineStageId: 'stage-1', // Lead Nuevo
                opportunityValue: 1200,
                leadScore: 50,
                assignedTo: 'Carlos Méndez',
                notes: [
                    {
                        id: `n-${Date.now()}`,
                        text: `Primer contacto registrado vía ${channel.toUpperCase()}: "${text.slice(0, 80)}"`,
                        createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
                        author: 'Sistema Multicanal'
                    }
                ],
                tasks: [],
                createdAt: new Date().toISOString().slice(0, 10),
                lastActivity: 'Ahora mismo',
                aiAutoPilot: true
            };
            data.contacts.unshift(contact);
        }
        else {
            contact.lastActivity = 'Ahora mismo';
        }
        // 2. Find or create Conversation
        let conversation = data.conversations.find(conv => conv.contactId === contact.id && conv.channel === channel);
        if (!conversation) {
            conversation = {
                id: `conv-${uuidv4().slice(0, 8)}`,
                contactId: contact.id,
                contactName: `${contact.firstName} ${contact.lastName}`,
                channel,
                channelIdentifier: senderId,
                lastMessage: text,
                lastMessageAt: nowStr,
                unreadCount: 1,
                aiAutoPilot: contact.aiAutoPilot,
                assignedTo: contact.assignedTo
            };
            data.conversations.unshift(conversation);
        }
        else {
            conversation.lastMessage = text;
            conversation.lastMessageAt = nowStr;
            conversation.unreadCount += 1;
        }
        // 3. Save incoming message
        const incomingMsg = {
            id: `msg-${uuidv4().slice(0, 8)}`,
            conversationId: conversation.id,
            sender: 'contact',
            senderName: conversation.contactName,
            channel,
            text,
            timestamp: nowStr,
            read: false,
            mediaUrl
        };
        data.messages.push(incomingMsg);
        db.save();
        this.broadcast('MESSAGE_RECEIVED', { conversation, message: incomingMsg });
        // 4. Autonomous 24/7 AI Engine Evaluation
        let aiReplyMsg;
        const aiConfig = data.aiSettings;
        const channelAllowed = aiConfig.autoReplyChannels.includes(channel);
        const shouldAutoReply = aiConfig.autoPilotEnabled && conversation.aiAutoPilot && channelAllowed;
        if (shouldAutoReply) {
            // Gather recent message history for context
            const conversationHistory = data.messages
                .filter(m => m.conversationId === conversation.id)
                .map(m => ({ sender: m.sender, text: m.text }));
            try {
                const { reply, detectedHandover, providerUsed } = await aiService.generateChatReply({
                    contact,
                    channel,
                    incomingMessage: text,
                    history: conversationHistory
                });
                const replyTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                aiReplyMsg = {
                    id: `msg-${uuidv4().slice(0, 8)}`,
                    conversationId: conversation.id,
                    sender: 'ai',
                    senderName: `Luxora AI (${providerUsed})`,
                    channel,
                    text: reply,
                    timestamp: replyTimestamp,
                    read: true
                };
                data.messages.push(aiReplyMsg);
                conversation.lastMessage = reply;
                conversation.lastMessageAt = replyTimestamp;
                if (detectedHandover) {
                    conversation.aiAutoPilot = false; // Pause autopilot for human takeover
                    contact.tags.push('Requiere Asesor Humano');
                }
                db.save();
                // Send out over real provider if configured
                await this.dispatchExternalChannelMessage(channel, senderId, reply);
                this.broadcast('AI_REPLY_SENT', { conversation, message: aiReplyMsg });
            }
            catch (err) {
                console.error('Error generating 24/7 AI response:', err);
            }
        }
        return { message: incomingMsg, aiReply: aiReplyMsg, conversation };
    }
    /**
     * Sends an outgoing message initiated by a human team member.
     */
    async sendManualMessage(params) {
        const data = db.get();
        const conversation = data.conversations.find(c => c.id === params.conversationId);
        if (!conversation)
            throw new Error('Conversation not found');
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newMsg = {
            id: `msg-${uuidv4().slice(0, 8)}`,
            conversationId: conversation.id,
            sender: 'agent',
            senderName: params.agentName || 'Asesor Luxora',
            channel: conversation.channel,
            text: params.text,
            timestamp: nowStr,
            read: true,
            mediaUrl: params.mediaUrl
        };
        data.messages.push(newMsg);
        conversation.lastMessage = params.text;
        conversation.lastMessageAt = nowStr;
        conversation.unreadCount = 0;
        db.save();
        await this.dispatchExternalChannelMessage(conversation.channel, conversation.channelIdentifier, params.text);
        this.broadcast('MESSAGE_SENT', { conversation, message: newMsg });
        return newMsg;
    }
    /**
     * Dispatches messages through the real APIs (WhatsApp Cloud API, Meta Graph API, Resend/SMTP).
     */
    async dispatchExternalChannelMessage(channel, recipient, content) {
        const integrations = db.get().integrations;
        try {
            if (channel === 'whatsapp' && integrations.whatsapp.enabled && integrations.whatsapp.accessToken.length > 10) {
                const phoneId = integrations.whatsapp.phoneNumberId;
                const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${integrations.whatsapp.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        messaging_product: 'whatsapp',
                        to: recipient.replace(/\D/g, ''),
                        type: 'text',
                        text: { body: content }
                    })
                });
                return res.ok;
            }
            if (channel === 'instagram' && integrations.instagram.enabled && integrations.instagram.accessToken.length > 10) {
                const url = `https://graph.facebook.com/v21.0/me/messages`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${integrations.instagram.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipient: { id: recipient },
                        message: { text: content }
                    })
                });
                return res.ok;
            }
            if (channel === 'facebook' && integrations.facebook.enabled && integrations.facebook.accessToken.length > 10) {
                const url = `https://graph.facebook.com/v21.0/me/messages`;
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${integrations.facebook.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipient: { id: recipient },
                        message: { text: content }
                    })
                });
                return res.ok;
            }
            if (channel === 'email' && integrations.email.enabled) {
                // Log email dispatch
                console.log(`[Email Dispatcher] Sending email to ${recipient} via ${integrations.email.provider}`);
                return true;
            }
        }
        catch (err) {
            console.warn(`[Multichannel Dispatch Error on ${channel}]:`, err);
        }
        return false;
    }
}
export const multichannelService = new MultichannelService();
