import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { Appointment, Contact } from '../types';
import { api } from '../api';

interface CalendarsViewProps {
  appointments: Appointment[];
  contacts: Contact[];
  onRefresh: () => void;
}

export const CalendarsView: React.FC<CalendarsViewProps> = ({
  appointments,
  contacts,
  onRefresh
}) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('Sesión de Asesoría Margarita Hub');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('16:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [serviceType, setServiceType] = useState('Demostración Comercial (30 min)');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const bookingLink = 'https://margaritahub.com/agendar-llamada';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) {
      alert('Nombre y correo son requeridos');
      return;
    }
    setLoading(true);

    try {
      await api.createAppointment({
        title,
        contactName,
        contactEmail,
        contactPhone,
        date,
        time,
        durationMinutes,
        serviceType,
        status: 'confirmed'
      });
      setShowModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return;
    try {
      await api.deleteAppointment(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Calendarios y Agendamiento Nativo
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              {appointments.length} citas programadas
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Gestiona reservas de citas, sesiones estratégicas y disponibilidad de llamadas comerciales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Booking link pill */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 hover:text-white transition"
            title="Copiar enlace público de reservas"
          >
            <Copy className="w-3.5 h-3.5 text-indigo-400" />
            <span>{copied ? '¡Copiado!' : 'Copiar Link de Agenda'}</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agendar Cita</span>
          </button>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map(app => (
          <div
            key={app.id}
            className="bg-gray-900/60 border border-gray-800/80 hover:border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                      {app.title}
                    </h3>
                    <span className="text-[10px] text-gray-400">{app.serviceType}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    app.status === 'confirmed'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                  }`}
                >
                  {app.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </span>
              </div>

              {/* Date & Time pill */}
              <div className="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800 mb-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-semibold">{app.date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-400 font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{app.time} ({app.durationMinutes} min)</span>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1 text-xs text-gray-400">
                <div className="flex items-center gap-1.5 text-gray-200 font-medium">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <span>{app.contactName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <span className="truncate">{app.contactEmail}</span>
                </div>
                {app.contactPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    <span>{app.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs">
              <span className="text-[10px] text-gray-500">Sincronizado con Google Calendar</span>
              <button
                onClick={() => handleDelete(app.id)}
                className="text-gray-500 hover:text-rose-400 text-[11px] transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Programar Cita Comercial</h2>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 block mb-1">Título del Evento</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 block mb-1">Nombre del Prospecto</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Ej: Laura Méndez"
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="laura@empresa.com"
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="+34 600..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-gray-300 block mb-1">Fecha</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Hora</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Duración</label>
                  <select
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-gray-950 border border-gray-800 rounded-lg px-2 py-2 text-white"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-md"
                >
                  {loading ? 'Guardando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
