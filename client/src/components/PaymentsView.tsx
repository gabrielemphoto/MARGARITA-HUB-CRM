import React from 'react';
import {
  CreditCard,
  DollarSign,
  Download,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plus,
  Receipt
} from 'lucide-react';
import { Transaction } from '../types';

interface PaymentsViewProps {
  transactions: Transaction[];
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({ transactions }) => {
  const totalVolume = transactions.reduce((sum, t) => sum + (t.status === 'paid' ? t.amount : 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Pagos, Facturación y Ventas
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
              ${totalVolume.toLocaleString()} USD Facturados
            </span>
          </h1>
          <p className="text-xs text-gray-400">
            Control de cobros integrados, facturación electrónica y pasarelas de pago (Stripe, PayPal, MercadoPago).
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition">
          <Plus className="w-3.5 h-3.5" />
          <span>Crear Factura / Cobro</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4">
          <span className="text-xs text-gray-400 block mb-1">Volumen Total Procesado</span>
          <span className="text-2xl font-black text-emerald-400">${totalVolume.toLocaleString()} USD</span>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4">
          <span className="text-xs text-gray-400 block mb-1">Transacciones Exitosas</span>
          <span className="text-2xl font-black text-white">{transactions.length}</span>
        </div>
        <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl p-4">
          <span className="text-xs text-gray-400 block mb-1">Pasarelas Activas</span>
          <span className="text-base font-bold text-indigo-400 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Stripe + PayPal Conectados
          </span>
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-gray-900/60 border border-gray-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-800 font-bold text-xs text-white">
          Historial de Transacciones y Facturas
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-950/80 border-b border-gray-800 text-gray-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Factura #</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Monto</th>
                <th className="py-3 px-4">Pasarela</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-right">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-gray-500">
                    <Receipt className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-50" />
                    No hay transacciones ni facturas registradas todavía. Conecta Stripe o registra un cobro.
                  </td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">{tx.invoiceNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{tx.contactName}</td>
                    <td className="py-3.5 px-4 text-gray-400">{tx.items?.[0]?.description || 'Venta'}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">${tx.amount} {tx.currency}</td>
                    <td className="py-3.5 px-4 uppercase font-mono text-[11px] text-gray-400">{tx.gateway}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                        {tx.status === 'paid' ? 'Pagado' : tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{tx.date}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white" title="Descargar PDF">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
