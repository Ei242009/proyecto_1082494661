'use client';

import { formatCurrency } from '@/helpers/formatCurrency';
import type { ReceiptData } from '@/types/client';

interface Props {
  receipt: ReceiptData;
}

export default function LiquidationReceipt({ receipt }: Props) {
  const negative = receipt.net_income < 0;

  return (
    <div className="mx-auto max-w-md">
      <div className="reveal ticket overflow-hidden print-safe">
        <div className={negative ? 'ticket-band ticket-band-ink' : 'ticket-band ticket-band-pos'} />

        {/* Encabezado tipo tiquete */}
        <div className="px-7 pt-6 text-center">
          <p className="board-led text-[11px]" style={{ color: 'var(--color-marigold-deep)' }}>BUSETA · APP</p>
          <h1 className="font-display mt-1 text-2xl font-extrabold text-ink">Comprobante de Liquidación</h1>
          <p className="mt-1 font-mono text-xs text-ink-faint">
            {new Date(receipt.closed_at).toLocaleDateString('es-CO', { dateStyle: 'long' })}
          </p>
        </div>

        <div className="px-7 pt-5">
          <div className="flex items-center justify-between font-mono text-xs uppercase tracking-wide text-ink-soft">
            <span>Conductor</span>
            <span className="text-ink">{receipt.conductor_name}</span>
          </div>
          <div className="mt-1 flex items-center justify-between font-mono text-xs uppercase tracking-wide text-ink-soft">
            <span>Cerrado por</span>
            <span className="text-ink">{receipt.closed_by_name}</span>
          </div>
        </div>

        <div className="tear mt-5" />

        {/* Detalle de la liquidación */}
        <div className="space-y-2.5 px-7 py-5">
          <Row label="Ingreso Bruto" value={`+${formatCurrency(receipt.gross_income)}`} />
          <Row label="(−) Tarifa Diaria" value={`−${formatCurrency(receipt.daily_fee_snapshot)}`} />
          <div className="flex items-center justify-between border-t border-dashed border-line-strong pt-2.5">
            <span className="font-mono text-xs uppercase tracking-wide text-ink-soft">Base post-tarifa</span>
            <span className="money text-sm text-ink">{formatCurrency(receipt.base_post_fee)}</span>
          </div>
        </div>

        <div className="bg-paper px-7 py-2">
          <p className="eyebrow">Gastos aprobados</p>
        </div>

        <div className="space-y-2.5 px-7 py-5">
          {receipt.approved_expenses.length === 0 ? (
            <p className="text-center text-sm text-ink-faint">Sin gastos aprobados.</p>
          ) : (
            receipt.approved_expenses.map((e) => (
              <div key={`${e.category}-${e.time}-${e.amount}`} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{e.category}</p>
                  <p className="truncate font-mono text-[11px] text-ink-faint">{e.time} · {e.description}</p>
                </div>
                <span className="money shrink-0 text-sm text-ink-soft">−{formatCurrency(e.amount)}</span>
              </div>
            ))
          )}
        </div>

        <div className="tear" />

        {/* Total */}
        <div className={`px-7 py-6 text-center ${negative ? 'bg-neg-tint' : 'bg-pos-tint'}`}>
          <p className="eyebrow">Utilidad Neta</p>
          <p className={`money mt-1 text-4xl ${negative ? 'money-neg' : 'money-pos'}`}>
            {negative ? '−' : ''}{formatCurrency(Math.abs(receipt.net_income))}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink-faint">
            {new Date(receipt.closed_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })} · COP
          </p>
        </div>
      </div>

      <button type="button" onClick={() => window.print()} className="btn btn-ghost no-print mt-4 w-full">
        Imprimir comprobante
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-ink-soft">{label}</span>
      <span className="money text-sm text-ink">{value}</span>
    </div>
  );
}
