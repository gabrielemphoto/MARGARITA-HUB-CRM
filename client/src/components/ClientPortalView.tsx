import React from 'react';
import {
  ShieldCheck,
  User,
  GraduationCap,
  Lock,
  Unlock,
  Plus,
  Clock,
  Key
} from 'lucide-react';
import { ClientPortalUser } from '../types';

interface ClientPortalViewProps {
  portalUsers: ClientPortalUser[];
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({ portalUsers }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Portal Privado del Cliente
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Seguridad & Accesos
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Administra credenciales, cursos autorizados y control de accesos para tus alumnos y clientes.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <Plus className="w-3.5 h-3.5" />
          <span>Invitar Nuevo Cliente</span>
        </button>
      </div>

      <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 font-semibold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Usuario</th>
              <th className="py-3 px-4">Correo</th>
              <th className="py-3 px-4">Estado de Acceso</th>
              <th className="py-3 px-4">Cursos Habilitados</th>
              <th className="py-3 px-4">Última Sesión</th>
              <th className="py-3 px-4 text-right">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 text-gray-200">
            {portalUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-800/40 transition">
                <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                </td>
                <td className="py-3.5 px-4 text-gray-400 font-mono">{user.email}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                    {user.accessStatus}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-indigo-400 font-semibold">
                    {user.enrolledCourses.length} cursos activos
                  </span>
                </td>
                <td className="py-3.5 px-4 text-gray-400">{user.lastLogin}</td>
                <td className="py-3.5 px-4 text-right">
                  <button className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-semibold transition">
                    Restablecer Clave
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
