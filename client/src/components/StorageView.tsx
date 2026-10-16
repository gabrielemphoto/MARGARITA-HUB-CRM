import React, { useState } from 'react';
import {
  HardDrive,
  Image as ImageIcon,
  Video,
  FileText,
  Upload,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { MediaFile } from '../types';

interface StorageViewProps {
  media: MediaFile[];
}

export const StorageView: React.FC<StorageViewProps> = ({ media }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Biblioteca Multimedia en la Nube (Almacenamiento)
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              CDN de Alta Velocidad
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Hospeda fotos, creativos publicitarios, videos para tus embudos y documentos PDF para enviar por WhatsApp.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <Upload className="w-3.5 h-3.5" />
          <span>Subir Archivo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {media.map(file => {
          const isImg = file.type === 'image';
          const isVid = file.type === 'video';
          const Icon = isImg ? ImageIcon : isVid ? Video : FileText;

          return (
            <div
              key={file.id}
              className="bg-gray-900/60 border border-gray-800/80 rounded-xl overflow-hidden hover:border-indigo-500/40 transition group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video bg-gray-950 flex items-center justify-center overflow-hidden relative">
                  {isImg ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <Icon className="w-10 h-10 text-gray-600 group-hover:text-indigo-400 transition" />
                  )}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-gray-300">
                    {file.size}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-xs text-white truncate mb-1">{file.name}</h3>
                  <div className="text-[11px] text-gray-500 font-mono">Subido: {file.uploadedAt}</div>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-950/80 border-t border-gray-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleCopy(file.id, file.url)}
                  className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  {copiedId === file.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedId === file.id ? 'Copiado' : 'Copiar URL'}</span>
                </button>
                <a href={file.url} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
