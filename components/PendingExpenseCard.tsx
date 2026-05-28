'use client';

import { useMemo, useState } from 'react';
import type { ExpenseWithShift } from '@/types/client';
import { formatCurrency } from '@/helpers/formatCurrency';

interface Props {
  expense: ExpenseWithShift;
  index?: number;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

function formatRelativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'hace segundos';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.round(hours / 24)} d`;
}

export default function PendingExpenseCard({ expense, index = 0, onApprove, onReject }: Props) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const relativeTime = useMemo(() => formatRelativeTime(expense.created_at), [expense.created_at]);

  async function handleApprove() {
    setSubmitting(true);
    setError('');
    try {
      await onApprove(expense.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aprobar');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (reason.trim().length < 5) {
      setError('El motivo debe tener al menos 5 caracteres.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onReject(expense.id, reason.trim());
      setIsRejecting(false);
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="reveal ticket overflow-hidden" style={{ ['--i' as string]: index }}>
      <div className="ticket-band ticket-band-ink" />
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">{expense.conductor_name}</p>
            <p className="font-mono mt-1 text-xs uppercase tracking-wide text-ink-faint">
              {expense.category} · turno {expense.shift_date}
            </p>
          </div>
          <span className="badge badge-warn">{relativeTime}</span>
        </div>

        <p className="money mt-3 text-3xl text-ink">{formatCurrency(expense.amount)}</p>
        <p className="mt-2 text-sm text-ink-soft">{expense.description}</p>
      </div>

      <div className="tear mt-5" />

      <div className="grid grid-cols-2 gap-3 px-5 py-4">
        <button type="button" onClick={handleApprove} disabled={submitting} className="btn btn-pos">Aprobar</button>
        <button type="button" onClick={() => setIsRejecting((c) => !c)} disabled={submitting} className="btn btn-neg">Rechazar</button>
      </div>

      {isRejecting ? (
        <div className="space-y-3 border-t border-dashed border-line-strong bg-neg-tint/40 px-5 py-4">
          <label className="label">Motivo del rechazo</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Describe por qué se rechaza este gasto"
            className="field"
          />
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={handleReject} disabled={submitting} className="btn btn-neg">Enviar rechazo</button>
            <button type="button" onClick={() => { setIsRejecting(false); setReason(''); setError(''); }} className="btn btn-ghost">Cancelar</button>
          </div>
        </div>
      ) : null}

      {error ? <div className="mx-5 mb-4 rounded-xl border border-neg/30 bg-neg-tint px-4 py-2 text-sm text-neg">{error}</div> : null}
    </article>
  );
}
