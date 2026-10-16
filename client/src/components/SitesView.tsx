import React from 'react';
import {
  Globe,
  ShoppingBag,
  FileText,
  Plus,
  ExternalLink,
  Edit,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { SiteItem } from '../types';

interface SitesViewProps {
  sites: SiteItem[];
}

export const SitesView: React.FC<SitesViewProps> = ({ sites }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Sitios Web, Tiendas Online y Blogs
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              CMS Integrado
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Constructores dedicados para páginas corporativas completas, catálogos e-commerce y publicación de blogs con SEO.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Sitio o Tienda</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sites.map(site => {
          const isStore = site.type === 'store';
          const isBlog = site.type === 'blog';
          const Icon = isStore ? ShoppingBag : isBlog ? FileText : Globe;

          return (
            <div
              key={site.id}
              className="bg-gray-900/60 border border-gray-800/80 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                    {site.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mb-1 group-hover:text-indigo-300 transition-colors">
                  {site.name}
                </h3>
                <div className="text-xs text-indigo-400 font-mono mb-4 flex items-center gap-1.5">
                  <Globe className="w-3 h-3" />
                  <span>https://{site.domain}</span>
                </div>

                <div className="p-3 rounded-lg bg-gray-950/80 border border-gray-800 text-xs text-gray-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Páginas Creadas:</span>
                    <span className="font-semibold text-white">{site.pagesCount} páginas</span>
                  </div>
                  {site.itemsCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{isStore ? 'Productos en Catálogo:' : 'Artículos de Blog:'}</span>
                      <span className="font-bold text-emerald-400">{site.itemsCount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-800">
                    <span>Última Edición:</span>
                    <span>{site.updatedAt}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                <button className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                  <Edit className="w-3.5 h-3.5" />
                  <span>Abrir Editor Visual</span>
                </button>
                <button className="text-gray-500 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
