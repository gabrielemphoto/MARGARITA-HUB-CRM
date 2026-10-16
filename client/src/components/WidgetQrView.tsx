import React, { useState } from 'react';
import {
  QrCode,
  MessageCircle,
  Copy,
  Check,
  Download,
  Sparkles,
  Bot,
  Sliders,
  ExternalLink,
  Code
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const WidgetQrView: React.FC = () => {
  const [qrUrl, setQrUrl] = useState('https://margaritahub.com/agendar-llamada');
  const [qrFgColor, setQrFgColor] = useState('#6366f1');
  const [greetingText, setGreetingText] = useState('¡Hola! Soy el asistente inteligente 24/7 de MARGARITA HUB CRM. ¿En qué puedo ayudarte hoy?');
  const [copiedScript, setCopiedScript] = useState(false);

  const scriptTag = `<script src="${window.location.origin}/widget.js" async></script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptTag);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('luxora-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'luxora-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Widget de Chat en Vivo y Generador de Códigos QR
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Captación Multicanal
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Instala la burbuja de atención con IA 24/7 en cualquier sitio web y genera códigos QR para stands, volantes o tarjetas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Chat Widget Installer */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Burbuja de Chat Web con IA 24/7</h2>
              <p className="text-xs text-gray-400">Incrustación universal con 1 sola línea de código</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-300 block">
              Mensaje Inicial de Bienvenida (del Agente IA)
            </label>
            <textarea
              rows={2}
              value={greetingText}
              onChange={e => setGreetingText(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Code className="w-4 h-4" /> Script para pegar antes de &lt;/body&gt;
              </span>
              <button
                onClick={handleCopyScript}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? '¡Copiado!' : 'Copiar Script'}</span>
              </button>
            </div>

            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-indigo-300 break-all select-all">
              {scriptTag}
            </div>
          </div>

          {/* Interactive Widget Preview */}
          <div className="p-4 rounded-xl bg-gray-950 border border-gray-800/80 space-y-3">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Vista Previa en Página Web:
            </div>
            <div className="relative h-44 bg-gray-900 rounded-lg border border-gray-800 p-4 flex flex-col justify-end items-end overflow-hidden">
              <div className="w-56 bg-gray-950 border border-gray-800 rounded-xl p-2.5 text-[11px] text-gray-200 shadow-xl mb-3">
                <div className="flex items-center gap-1.5 font-bold text-indigo-400 text-[10px] mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Margarita AI 24/7
                </div>
                <p className="line-clamp-2">{greetingText}</p>
              </div>

              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg cursor-pointer">
                💬
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: QR Code Generator */}
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Generador Dinámico de Códigos QR</h2>
              <p className="text-xs text-gray-400">Conecta prospectos físicos a tus flujos de WhatsApp o embudos</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Destino del Código QR (Enlace, WhatsApp o Embudo):
              </label>
              <input
                type="text"
                value={qrUrl}
                onChange={e => setQrUrl(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-xs text-white font-mono"
              />
            </div>

            {/* Color selector */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Color de Marca del QR:
              </label>
              <div className="flex gap-2">
                {[
                  { name: 'Indigo Margarita', color: '#6366f1' },
                  { name: 'Emerald', color: '#10b981' },
                  { name: 'Purple', color: '#a855f7' },
                  { name: 'Gold Amber', color: '#f59e0b' },
                  { name: 'Blanco Puro', color: '#ffffff' }
                ].map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setQrFgColor(c.color)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      qrFgColor === c.color ? 'border-white scale-110 shadow-lg' : 'border-gray-800'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* QR Display */}
          <div className="p-6 bg-gray-950 border border-gray-800 rounded-xl flex flex-col items-center justify-center space-y-4">
            <div className="p-3 bg-white rounded-xl shadow-2xl">
              <QRCodeSVG
                id="luxora-qr-svg"
                value={qrUrl}
                size={180}
                fgColor={qrFgColor === '#ffffff' ? '#000000' : qrFgColor}
                bgColor="#ffffff"
                level="H"
              />
            </div>

            <button
              onClick={handleDownloadQR}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Código QR (PNG Alta Calidad)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
