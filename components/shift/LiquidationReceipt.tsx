'use client';

import { formatCurrency } from '@/helpers/formatCurrency';
import type { ReceiptData } from '@/types/client';

interface Props {
  receipt: ReceiptData;
}

export default function LiquidationReceipt({ receipt }: Props) {
  return (
    <div className="mx-auto max-w-3xl rounded-[20px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700">BusetaApp</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-900">Comprobante de Liquidación</h1>
        </div>
        <div className="rounded-3xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Turno: {new Date(receipt.closed_at).toLocaleDateString('es-CO', { dateStyle: 'long' })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-stone-50 p-4">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Conductor</p>
          <p className="mt-2 text-lg font-semibold text-stone-900">{receipt.conductor_name}</p>
        </div>
        <div className="rounded-3xl bg-stone-50 p-4">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Cerrado por</p>
          <p className="mt-2 text-lg font-semibold text-stone-900">{receipt.closed_by_name}</p>
          <p className="mt-1 text-sm text-stone-500">{new Date(receipt.closed_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[20px] border border-stone-200 text-sm text-stone-700">
        <div className="bg-stone-50 px-5 py-4 font-semibold text-stone-900">Detalle</div>
        <div className="space-y-3 px-5 py-4">
          <div className="flex items-center justify-between">
            <span>Ingreso Bruto</span>
            <span className="font-semibold text-stone-900">+{formatCurrency(receipt.gross_income)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>(–) Tarifa Diaria</span>
            <span className="font-semibold text-stone-900">–{formatCurrency(receipt.daily_fee_snapshot)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-stone-200 pt-3">
            <span>Base Post-Tarifa</span>
            <span className="font-semibold text-stone-900">{formatCurrency(receipt.base_post_fee)}</span>
          </div>
        </div>

        <div className="border-t border-stone-200 bg-stone-50 px-5 py-4 text-sm uppercase tracking-[0.2em] text-stone-500">
          Gastos aprobados
        </div>

        <div className="space-y-3 px-5 py-4">
          {receipt.approved_expenses.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
              No hay gastos aprobados en este turno.
            </div>
          ) : (
            receipt.approved_expenses.map((expense) => (
              <div key={`${expense.category}-${expense.time}-${expense.amount}`} className="flex items-center justify-between gap-4 rounded-3xl border border-stone-200 bg-white px-4 py-3">
                <div>
                  <p className="font-semibold text-stone-900">{expense.category}</p>
                  <p className="text-xs text-stone-500">{expense.time} · {expense.description}</p>
                </div>
                <span className="font-semibold text-stone-900">–{formatCurrency(expense.amount)}</span>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-stone-200 bg-stone-50 px-5 py-4">
          <div className="flex items-center justify-between text-sm font-semibold text-stone-900">
            <span>UTILIDAD NETA</span>
            <span className={`text-lg ${receipt.net_income < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {receipt.net_income < 0 ? '-' : '+'}{formatCurrency(Math.abs(receipt.net_income))}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="rounded-3xl bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Este comprobante se puede imprimir sin eliminar datos financieros.
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-[48px] items-center justify-center rounded-3xl bg-amber-600 px-6 text-base font-semibold text-white transition hover:bg-amber-700"
        >
          Imprimir comprobante
        </button>
      </div>
    </div>
  );
}
