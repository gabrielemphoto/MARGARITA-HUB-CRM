# MARGARITA HUB CRM — Suite All-in-One CRM, Marketing, Embudos & Agentes de IA 24/7

**MARGARITA HUB CRM** es una plataforma integral de alto rendimiento diseñada para captar clientes potenciales (leads), gestionar oportunidades comerciales en pipelines visuales, construir embudos de conversión, agendar citas en calendarios nativos, procesar pagos y automatizar comunicaciones multicanal mediante **Agentes de Inteligencia Artificial que operan 24/7 de forma autónoma**.

---

## 🚀 Arquitectura y Tecnologías

- **Frontend (`client/`)**:
  - React 19 + TypeScript + Vite 8
  - TailwindCSS 4 con diseño oscuro de lujo (*slate/zinc, indigo, emerald y glassmorphism*)
  - Recharts para analítica visual de embudos y pipelines
  - Generador de Códigos QR nativo (`qrcode.react`)
  - Conexión WebSocket en tiempo real para actualización instantánea de mensajes y leads
  - Almacenamiento reactivo local para soporte estático en **GitHub Pages** (visualización directa en móviles)

- **Backend (`server/`)**:
  - Node.js + Express 5 + TypeScript
  - Servidor WebSocket para bus de eventos en vivo
  - Base de datos persistente en JSON
  - **Universal AI Gateway**: Conexión nativa con **OpenAI**, **Google Gemini**, **Anthropic Claude**, **Groq** y servidores locales o privados **OpenAI-Compatible (Ollama, LM Studio, DeepSeek, LocalAI)**
  - Motor de **Autopilot 24/7**: Lee el contexto del negocio, califica prospectos, responde dudas y detecta palabras clave para traspaso a humanos
  - Módulos multicanal para **WhatsApp Cloud API**, **Instagram Direct**, **Facebook Messenger**, **Email** y **Chat Web Incrustable (`/widget.js`)**

---

## 📦 Estructura de Módulos Implementados

### 1. Gestión Comercial y CRM
- **Launchpad**: Panel de inicio rápido para conectar WhatsApp, Instagram, Email, Stripe y el motor de IA con barra de progreso.
- **Dashboard (Tablero de Control)**: Monitoreo en tiempo real de valor de pipeline, ingresos ganados, tasa de conversión, gráfico comparativo de visitas vs. conversiones por embudo y distribución por etapas.
- **Contactos**: Base de datos inteligente con listas segmentadas (*Leads de Alta Prioridad, Instagram, Clientes VIP, Agencias*), etiquetas dinámicas, lead scoring (0-100), recordatorios de cumpleaños y panel lateral para registrar notas internas y tareas pendientes.
- **Oportunidades (Pipelines)**: Tablero Kanban visual con cálculo automático de valor por etapa y botones de avance rápido entre fases (*Lead Nuevo, Contactado, Cita Agendada, Propuesta Enviada, Ganado, Perdido*).
- **Social (Comunicaciones / Omni-Inbox)**: Centro de mensajería unificada multicanal con visualización de chats, botón **"Escribir con IA"** para redactar respuestas persuasivas y conmutador individual de **"IA 24/7 Autopilot"**.
- **Calendarios**: Sistema nativo de reservas con selector de fecha/hora, confirmación automática y generación de enlace público.

### 2. Creación de Sitios, Embudos y Captación (Sitios)
- **Embudos (Funnels)**: Constructor de páginas por pasos (*Optin, VSL, Checkout, Agradecimiento*), conmutador de **Pruebas A/B (50/50)**, temporizador de cuenta atrás (countdown timer) y **Generador de SEO con Inteligencia Artificial**.
- **Formularios**: Catálogo de plantillas (+1,000 plantillas concept), campos personalizables, integración de venta de productos o cobros con tarjeta y generador de código de incrustación `<iframe>`.
- **Encuestas y Cuestionarios**: Evaluador interactivo con puntuación por respuesta y umbrales de cualificación automática.
- **Sitios Web, Tiendas y Blogs**: Gestor corporativo para páginas web, tiendas online con catálogo y editor de artículos de blog.
- **Seminarios Web (Webinars)**: Estructuración de lanzamientos en directo y clases maestras con sala virtual y contador.
- **Portal del Cliente**: Espacio seguro para clientes con control de accesos y membresías activas.
- **Widget de Chat y Códigos QR**: Script embebible (`/widget.js`) para cualquier web y generador dinámico de códigos QR descargables en PNG con colores personalizados.
- **Analítica de Sitios**: Reporte de abandono por paso de embudo, fuentes de adquisición (*WhatsApp, Instagram, Ads, Directo*) y desglose por dispositivo.

### 3. Automatización e Inteligencia Artificial
- **Agentes de AI (24/7)**:
  - Selector de proveedor: **OpenAI**, **Gemini**, **Claude**, **Groq** o **Custom / Ollama**.
  - System prompt, temperatura, tokens y base de conocimiento del negocio.
  - Canales autorizados (*WhatsApp, Instagram, Facebook, Email, Webchat*).
  - Detección de traspaso a asesor humano (*Handover*).
  - **Playground Interactivo**: Simulador de conversación para probar al agente en tiempo real.
- **Flujos de Trabajo (Workflows)**:
  - Organizador por carpetas temáticas.
  - Secuencia visual de pasos con disparadores (*Formulario enviado, Mensaje entrante, Cita agendada, Pago recibido*), acciones multicanal (*WhatsApp, Email, Instagram*), lógica (*If/Else*), retardos (*Time Delay*) y modificación de score.
  - **"Construir vía AI"**: Permite describir la automatización en lenguaje natural y la IA genera la estructura completa de nodos.

### 4. Monetización, Formación y Administración
- **Pagos y Facturación**: Libro mayor de transacciones, facturas con ID único y pasarelas (*Stripe, PayPal*).
- **Membresías (Cursos)**: Plataforma LMS para alojar cursos con módulos y lecciones en video.
- **Marketing Masivo**: Envío de boletines y campañas de correo con analítica de tasa de apertura y clics.
- **Almacenamiento Cloud**: Biblioteca multimedia para creativos, videos de embudos y documentos PDF.
- **Reputación e Informes**: Control de reseñas de Google y Trustpilot con generador de respuestas con IA.
- **Integraciones y APIs**: Configuración centralizada de credenciales de Meta Graph API, Webhooks y endpoints.

---

## 📱 Ver en Vivo en Móvil (GitHub Pages)

La aplicación está disponible en GitHub Pages en:
`https://gabrielemphoto.github.io/MARGARITA-HUB-CRM/`
