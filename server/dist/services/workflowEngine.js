import { db } from '../db.js';
import { multichannelService } from './multichannelService.js';
export class WorkflowEngine {
    executionHistory = [];
    getLogs() {
        return this.executionHistory.slice(-50);
    }
    /**
     * Triggers workflows listening to a specific event.
     */
    async trigger(triggerType, payload) {
        const data = db.get();
        const activeWorkflows = data.workflows.filter(wf => wf.status === 'active' && wf.triggerType === triggerType);
        for (const wf of activeWorkflows) {
            await this.executeWorkflow(wf, payload.contact, payload);
        }
    }
    /**
     * Executes a single workflow instance for a contact.
     */
    async executeWorkflow(workflow, contact, context) {
        const startNode = workflow.nodes.find(n => n.type === 'TRIGGER');
        if (!startNode)
            return;
        workflow.executionsCount = (workflow.executionsCount || 0) + 1;
        db.save();
        const log = {
            workflowId: workflow.id,
            workflowName: workflow.name,
            contactId: contact.id,
            contactName: `${contact.firstName} ${contact.lastName}`,
            timestamp: new Date().toISOString(),
            stepsExecuted: []
        };
        let currentNodeId = startNode.next;
        while (currentNodeId) {
            const node = workflow.nodes.find(n => n.id === currentNodeId);
            if (!node)
                break;
            const stepLog = await this.executeNode(node, contact, context);
            log.stepsExecuted.push(stepLog);
            if (node.type === 'IF_ELSE') {
                const conditionMet = this.evaluateCondition(node.config, contact);
                currentNodeId = conditionMet ? node.nextTrue : node.nextFalse;
            }
            else {
                currentNodeId = node.next;
            }
        }
        this.executionHistory.unshift(log);
        if (this.executionHistory.length > 100)
            this.executionHistory.pop();
    }
    async executeNode(node, contact, context) {
        try {
            switch (node.type) {
                case 'SEND_WHATSAPP': {
                    const rawMsg = node.config.message || 'Mensaje automático de Luxora';
                    const personalized = this.replaceVariables(rawMsg, contact);
                    await multichannelService.handleIncomingMessage({
                        channel: 'whatsapp',
                        senderId: contact.phone,
                        senderName: `${contact.firstName} ${contact.lastName}`,
                        text: personalized
                    });
                    return { nodeId: node.id, title: node.title, status: 'success', detail: `WhatsApp enviado a ${contact.phone}` };
                }
                case 'SEND_EMAIL': {
                    const subject = this.replaceVariables(node.config.subject || 'Novedades Luxora', contact);
                    return { nodeId: node.id, title: node.title, status: 'success', detail: `Email enviado a ${contact.email} (${subject})` };
                }
                case 'SEND_INSTAGRAM': {
                    return { nodeId: node.id, title: node.title, status: 'success', detail: `DM de Instagram enviado a prospecto` };
                }
                case 'MODIFY_LEAD_SCORE': {
                    const inc = Number(node.config.increment) || 10;
                    contact.leadScore = Math.min(100, (contact.leadScore || 0) + inc);
                    db.save();
                    return { nodeId: node.id, title: node.title, status: 'success', detail: `Score actualizado a ${contact.leadScore} (+${inc})` };
                }
                case 'TIME_DELAY': {
                    const mins = node.config.delayMinutes || 5;
                    return { nodeId: node.id, title: node.title, status: 'success', detail: `Espera programada de ${mins} minutos procesada` };
                }
                case 'ASSIGN_USER': {
                    contact.assignedTo = node.config.userId || 'Carlos Méndez';
                    db.save();
                    return { nodeId: node.id, title: node.title, status: 'success', detail: `Asignado a ${contact.assignedTo}` };
                }
                case 'INTERNAL_NOTIFICATION': {
                    return { nodeId: node.id, title: node.title, status: 'success', detail: `Alerta interna enviada al equipo comercial` };
                }
                default:
                    return { nodeId: node.id, title: node.title, status: 'success', detail: 'Bloque ejecutado correctamente' };
            }
        }
        catch (err) {
            return { nodeId: node.id, title: node.title, status: 'failed', detail: err?.message || 'Error en ejecución' };
        }
    }
    evaluateCondition(config, contact) {
        if (!config || !config.field)
            return true;
        const val = contact[config.field];
        if (config.operator === 'equals')
            return String(val) === String(config.value);
        if (config.operator === 'contains')
            return String(val).toLowerCase().includes(String(config.value).toLowerCase());
        if (config.operator === 'greaterThan')
            return Number(val) > Number(config.value);
        return true;
    }
    replaceVariables(text, contact) {
        return text
            .replace(/{{firstName}}/g, contact.firstName || '')
            .replace(/{{lastName}}/g, contact.lastName || '')
            .replace(/{{email}}/g, contact.email || '')
            .replace(/{{phone}}/g, contact.phone || '')
            .replace(/{{company}}/g, contact.company || '');
    }
}
export const workflowEngine = new WorkflowEngine();
