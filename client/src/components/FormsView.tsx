import React, { useState } from 'react';
import {
  FileText,
  Plus,
  CreditCard,
  CheckCircle2,
  Code,
  Copy,
  Eye,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { FormItem } from '../types';
import { api } from '../api';

interface FormsViewProps {
  forms: FormItem[];
  onRefresh: () => void;
}

export const FormsView: React.FC<FormsViewProps> = ({ forms, onRefresh }) => {
  const [selectedForm, setSelectedForm] = useState<FormItem>(forms[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Test form input state
  const [testData, setTestData] = useState({
    firstName: 'Alejandro',
    lastName: 'Vargas',
    email: 'alejandro@vargasgrowth.com',
    phone: '+34 677 889 900',
    company: 'Vargas Growth Capital',
    companyRevenue: '$10k - $50k/mes'
  });

  // New form modal state
  const [newFormName, setNewFormName] = useState('Nuevo Formulario de Registro');
  const [hasPayment, setHasPayment] = useState(false);
  const [productName, setProductName] = useState('Acceso Programa Mastermind');
  const [productPrice, setProductPrice] = useState(297);

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForm) return;
    setTestSubmitting(true);
    setTestSuccess(false);

    try {
      await api.submitForm(selectedForm.id, testData);
      setTestSuccess(true);
      onRefresh();
      setTimeout(() => setTestSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Error al enviar formulario');
    } finally {
      setTestSubmitting(false);
    }
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createForm({
        name: newFormName,
        hasPayment,
        productName: hasPayment ? productName : undefined,
        productPrice: hasPayment ? Number(productPrice) : 0,
        fields: [
          { name: 'firstName', label: 'Nombre', type: 'text', required: true },
          { name: 'lastName', label: 'Apellido', type: 'text', required: true },
          { name: 'email', label: 'Correo Electrónico', type: 'email', required: true },
          { name: 'phone', label: 'WhatsApp', type: 'tel', required: true }
        ]
      });
      setShowCreateModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const embedCode = `<iframe src="https://margaritahub.com/forms/${selectedForm?.id || 'form-1'}" width="100%" height="600" frameborder="0"></iframe>`;

  const templates = [
    { name: 'Captación Inmobiliaria VIP', category: 'Bienes Raíces', fields: 6 },
    { name: 'Cualificación B2B High-Ticket', category: 'Consultoría', fields: 8 },
    { name: 'Registro a Masterclass con Cobro', category: 'Educación & Cursos', fields: 5 },
    { name: 'Formulario de Cita Odontológica / Estética', category: 'Salud y Clínicas', fields: 7 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Constructor de Formularios y Captación
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
              Catálogo de +1,000 Plantillas
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Recopila datos personales, programa citas e integra cobros y venta de productos directamente en el formulario.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Formulario</span>
        </button>
      </div>

      {/* Main Grid: Form List & Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Form selector & Template Library */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Formularios Activos ({forms.length})
          </h2>

          <div className="space-y-2.5">
            {forms.map(form => {
              const isSelected = selectedForm?.id === form.id;
              return (
                <div
                  key={form.id}
                  onClick={() => setSelectedForm(form)}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/40 to-transparent border-indigo-500/50 shadow-md ring-1 ring-indigo-500/20'
                      : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs font-bold text-white">{form.name}</h3>
                      {form.hasPayment && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold flex items-center gap-1">
                          <CreditCard className="w-2.5 h-2.5" /> Pago ${form.productPrice}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2">
                      <span>{form.fields.length} campos de captura</span>
                      <span>•</span>
                      <span className="text-indigo-400 font-semibold">{form.submissionsCount} envíos</span>
                    </div>
                  </div>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      setSelectedForm(form);
                      setShowEmbedModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                    title="Obtener código de incrustación iframe"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Plantillas Destacadas */}
          <div className="pt-4 border-t border-gray-800/80 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Plantillas Destacadas del Catálogo</span>
              <span className="text-[10px] text-indigo-400 font-semibold">1,000+ disponibles</span>
            </h3>

            <div className="space-y-2">
              {templates.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-gray-300 block">{tmpl.name}</span>
                    <span className="text-[10px] text-gray-500">{tmpl.category}</span>
                  </div>
                  <button
                    onClick={() => {
                      setNewFormName(tmpl.name);
                      setShowCreateModal(true);
                    }}
                    className="text-[11px] text-indigo-400 hover:underline font-semibold"
                  >
                    Usar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Form Submission Tester */}
        <div className="lg:col-span-7">
          {selectedForm ? (
            <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Vista Previa & Prueba Interactiva</h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    Completa este formulario para probar el guardado automático en el CRM y la activación de workflows.
                  </p>
                </div>

                <button
                  onClick={() => setShowEmbedModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Incrustar (iFrame)</span>
                </button>
              </div>

              {testSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>¡Formulario enviado con éxito! Se ha creado el contacto en el CRM y disparado la automatización.</span>
                </div>
              )}

              {/* Form renderer */}
              <form onSubmit={handleTestSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Nombre *</label>
                    <input
                      type="text"
                      required
                      value={testData.firstName}
                      onChange={e => setTestData({ ...testData, firstName: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Apellido *</label>
                    <input
                      type="text"
                      required
                      value={testData.lastName}
                      onChange={e => setTestData({ ...testData, lastName: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={testData.email}
                      onChange={e => setTestData({ ...testData, email: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={testData.phone}
                      onChange={e => setTestData({ ...testData, phone: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Empresa</label>
                    <input
                      type="text"
                      value={testData.company}
                      onChange={e => setTestData({ ...testData, company: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 block mb-1 font-semibold">Facturación Mensual</label>
                    <select
                      value={testData.companyRevenue}
                      onChange={e => setTestData({ ...testData, companyRevenue: e.target.value })}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Menos de $10k/mes">Menos de $10,000 USD/mes</option>
                      <option value="$10k - $50k/mes">$10,000 a $50,000 USD/mes</option>
                      <option value="Más de $50k/mes">Más de $50,000 USD/mes</option>
                    </select>
                  </div>
                </div>

                {/* Embedded Payment Box */}
                {selectedForm.hasPayment && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-gray-950 border border-emerald-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-white">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CreditCard className="w-4 h-4" /> Pago Integrado en Formulario
                      </span>
                      <span>${selectedForm.productPrice} USD</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Producto: {selectedForm.productName || 'Servicio Digital'} (Checkout Seguro con Stripe / Tarjeta)
                    </p>
                    <div className="p-2 rounded bg-gray-900 border border-gray-800 text-[11px] text-gray-400 font-mono">
                      💳 Tarjeta: •••• •••• •••• 4242 | Exp: 12/28 | CVC: •••
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={testSubmitting}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  {testSubmitting ? (
                    <span>Procesando envío...</span>
                  ) : (
                    <>
                      <span>{selectedForm.hasPayment ? `Completar Registro y Pago ($${selectedForm.productPrice} USD)` : 'Enviar Formulario y Solicitar Asesoría'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-gray-500">
              Selecciona o crea un formulario para previsualizarlo.
            </div>
          )}
        </div>
      </div>

      {/* Embed Code Modal */}
      {showEmbedModal && selectedForm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Código de Incrustación (Embed Code)</h3>
            <p className="text-xs text-gray-400">
              Copia y pega este código HTML en cualquier sitio web externo, WordPress o landing page para mostrar el formulario.
            </p>

            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl font-mono text-xs text-indigo-300 break-all select-all">
              {embedCode}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-2 text-xs text-gray-400 hover:text-white"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(embedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md"
              >
                {copied ? '¡Copiado!' : 'Copiar Código'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Nuevo Formulario de Captación</h3>

            <form onSubmit={handleCreateForm} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 block mb-1">Nombre del Formulario</label>
                <input
                  type="text"
                  required
                  value={newFormName}
                  onChange={e => setNewFormName(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg p-2.5 text-white"
                />
              </div>

              {/* Payment toggle */}
              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Integrar Cobro o Venta</span>
                  <span className="text-[10px] text-gray-400">Permite cobrar al enviar el formulario</span>
                </div>
                <input
                  type="checkbox"
                  checked={hasPayment}
                  onChange={e => setHasPayment(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
              </div>

              {hasPayment && (
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-950 border border-gray-800">
                  <div>
                    <label className="text-gray-400 block mb-1">Nombre Producto</label>
                    <input
                      type="text"
                      value={productName}
                      onChange={e => setProductName(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Precio ($ USD)</label>
                    <input
                      type="number"
                      value={productPrice}
                      onChange={e => setProductPrice(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-gray-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md"
                >
                  Crear Formulario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
