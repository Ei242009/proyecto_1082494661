'use client';

import { useMemo, useState } from 'react';
import type { ExpenseWithShift } from '@/types/client';
import { formatCurrency } from '@/helpers/formatCurrency';

interface Props {
  expense: ExpenseWithShift;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return 'Hace unos segundos';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} horas`;
  const days = Math.round(hours / 24);
  return `Hace ${days} días`;
}

export default function PendingExpenseCard({ expense, onApprove, onReject }: Props) {
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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al aprobar');
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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al rechazar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Conductor</p>
          <p className="mt-1 text-lg font-semibold text-stone-900">{expense.conductor_name}</p>
          <p className="mt-2 text-sm text-stone-500">{expense.category}</p>
        </div>

        <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">
          {relativeTime}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-2xl font-semibold text-stone-900">{formatCurrency(expense.amount)}</p>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">{expense.status}</span>
      </div>

      <p className="mt-4 text-sm text-stone-600">{expense.description}</p>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone-400">Turno: {expense.shift_date}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={submitting}
          className="inline-flex min-h-[48px] items-center justify-center rounded-3xl bg-emerald-600 px-4 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Aprobar
        </button>
        <button
          type="button"
          onClick={() => setIsRejecting((current) => !current)}
          disabled={submitting}
          className="inline-flex min-h-[48px] items-center justify-center rounded-3xl bg-rose-600 px-4 text-base font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Rechazar
        </button>
      </div>

      {isRejecting ? (
        <div className="mt-4 space-y-3 rounded-3xl border border-rose-200 bg-rose-50 p-4">
          <label className="block text-sm font-medium text-stone-700">Motivo del rechazo</label>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="Describe por qué se rechaza este gasto"
            className="w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReject}
              disabled={submitting}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-3xl bg-rose-600 px-4 text-base font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Enviar rechazo
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRejecting(false);
                setReason('');
                setError('');
              }}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-3xl border border-stone-300 bg-white px-4 text-base font-semibold text-stone-900 transition hover:bg-stone-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </article>
  );
}
