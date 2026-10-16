import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { apiRouter } from './routes/api.js';
import { multichannelService } from './services/multichannelService.js';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API router
app.use('/api', apiRouter);

// ==========================================
// EMBEDDABLE CHAT WIDGET JS SCRIPT (/widget.js)
// ==========================================
app.get('/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
(function() {
  const host = window.location.origin;
  const bubble = document.createElement('div');
  bubble.id = 'luxora-chat-widget';
  bubble.innerHTML = \`
    <style>
      #luxora-chat-widget {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        font-family: system-ui, sans-serif;
      }
      .luxora-bubble-btn {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #9333ea);
        box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: transform 0.2s;
      }
      .luxora-bubble-btn:hover {
        transform: scale(1.08);
      }
      .luxora-chat-window {
        display: none;
        position: absolute;
        bottom: 75px;
        right: 0;
        width: 360px;
        height: 520px;
        background: #0f172a;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        flex-direction: column;
        overflow: hidden;
      }
      .luxora-chat-header {
        background: #1e293b;
        padding: 14px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .luxora-chat-body {
        flex: 1;
        padding: 12px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 14px;
        color: #e2e8f0;
      }
      .luxora-chat-input-bar {
        padding: 10px;
        display: flex;
        gap: 6px;
        background: #1e293b;
      }
      .luxora-chat-input-bar input {
        flex: 1;
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 8px;
        padding: 8px 12px;
        color: white;
        font-size: 13px;
        outline: none;
      }
      .luxora-chat-input-bar button {
        background: #6366f1;
        border: none;
        color: white;
        padding: 8px 14px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
      }
      .luxora-msg-ai {
        background: #312e81;
        color: #e0e7ff;
        padding: 8px 12px;
        border-radius: 12px 12px 12px 2px;
        max-width: 80%;
      }
      .luxora-msg-user {
        background: #475569;
        color: white;
        padding: 8px 12px;
        border-radius: 12px 12px 2px 12px;
        align-self: flex-end;
        max-width: 80%;
      }
    </style>
    <div class="luxora-chat-window" id="luxoraWindow">
      <div class="luxora-chat-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="width:10px; height:10px; border-radius:50%; background:#10b981;"></div>
          <strong>Luxora AI 24/7</strong>
        </div>
        <span style="cursor:pointer;" onclick="document.getElementById('luxoraWindow').style.display='none'">✕</span>
      </div>
      <div class="luxora-chat-body" id="luxoraMessages">
        <div class="luxora-msg-ai">¡Hola! Soy el asistente inteligente 24/7 de Luxora Digital. ¿En qué puedo ayudarte hoy?</div>
      </div>
      <div class="luxora-chat-input-bar">
        <input type="text" id="luxoraInput" placeholder="Escribe tu mensaje..." onkeydown="if(event.key==='Enter') window.luxoraSend()" />
        <button onclick="window.luxoraSend()">Enviar</button>
      </div>
    </div>
    <div class="luxora-bubble-btn" onclick="const w = document.getElementById('luxoraWindow'); w.style.display = w.style.display === 'flex' ? 'none' : 'flex';">
      💬
    </div>
  \`;
  document.body.appendChild(bubble);

  window.luxoraSend = async function() {
    const inp = document.getElementById('luxoraInput');
    const msg = inp.value.trim();
    if (!msg) return;
    inp.value = '';

    const container = document.getElementById('luxoraMessages');
    const uDiv = document.createElement('div');
    uDiv.className = 'luxora-msg-user';
    uDiv.innerText = msg;
    container.appendChild(uDiv);
    container.scrollTop = container.scrollHeight;

    try {
      const res = await fetch('/api/webhooks/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'webchat',
          senderId: 'visitante_' + (localStorage.getItem('luxora_uid') || (localStorage.setItem('luxora_uid', Date.now()), Date.now())),
          senderName: 'Visitante Web',
          text: msg
        })
      });
      const data = await res.json();
      if (data && data.aiReply) {
        const aiDiv = document.createElement('div');
        aiDiv.className = 'luxora-msg-ai';
        aiDiv.innerText = data.aiReply.text;
        container.appendChild(aiDiv);
        container.scrollTop = container.scrollHeight;
      }
    } catch(e) {
      console.error(e);
    }
  };
})();
  `);
});

// ==========================================
// REAL META WEBHOOK VERIFICATION & DISPATCH
// ==========================================
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const integrations = db.get().integrations;

  if (mode === 'subscribe' && token === integrations.whatsapp.verifyToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post('/api/webhooks/whatsapp', async (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (message && message.type === 'text') {
        await multichannelService.handleIncomingMessage({
          channel: 'whatsapp',
          senderId: message.from,
          senderName: contact?.profile?.name || 'Usuario WhatsApp',
          text: message.text.body
        });
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('WhatsApp Webhook error:', err);
    res.sendStatus(500);
  }
});

// Instagram webhook
app.get('/api/webhooks/instagram', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const integrations = db.get().integrations;
  if (token === integrations.instagram.verifyToken) return res.send(challenge);
  res.sendStatus(403);
});

app.post('/api/webhooks/instagram', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const messaging = entry?.messaging?.[0];
    if (messaging && messaging.message?.text) {
      await multichannelService.handleIncomingMessage({
        channel: 'instagram',
        senderId: messaging.sender.id,
        senderName: 'Usuario Instagram',
        text: messaging.message.text
      });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Instagram Webhook error:', err);
    res.sendStatus(500);
  }
});

// Facebook webhook
app.get('/api/webhooks/facebook', (req, res) => {
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const integrations = db.get().integrations;
  if (token === integrations.facebook.verifyToken) return res.send(challenge);
  res.sendStatus(403);
});

// Serve frontend static build if available
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/widget.js')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}


// Create HTTP and WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Luxora Digital WebSocket Gateway Ready' }));
});

// Register realtime broadcaster
multichannelService.registerBroadcaster((type, payload) => {
  const raw = JSON.stringify({ type, payload });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(raw);
    }
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LUXORA DIGITAL ALL-IN-ONE SUITE & 24/7 AI AGENT ENGINE`);
  console.log(`📡 Backend Server running on http://localhost:${PORT}`);
  console.log(`🌐 Live Chat Widget: http://localhost:${PORT}/widget.js`);
  console.log(`🤖 Universal AI Gateway ready (OpenAI, Gemini, Claude, Groq, Ollama)`);
  console.log(`💬 Multichannel connected: WhatsApp, Instagram, Facebook, Email`);
  console.log(`=======================================================`);
});
