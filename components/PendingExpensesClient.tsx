'use client';

import { useEffect, useState } from 'react';
import PendingExpenseCard from './PendingExpenseCard';
import type { ExpenseWithShift } from '@/types/client';

export default function PendingExpensesClient() {
  const [expenses, setExpenses] = useState<ExpenseWithShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  async function loadExpenses() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/expenses/pending?list=true', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setToast({ type: 'error', message: 'Tu sesión expiró. Redirigiendo…' });
          window.setTimeout(() => { window.location.href = '/'; }, 1200);
          return;
        }
        throw new Error(data.error || 'No se pudo obtener la lista de gastos pendientes.');
      }
      setExpenses(data.expenses ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadExpenses(); }, []);

  async function handleApprove(id: string) {
    const response = await fetch(`/api/expenses/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    const data = await response.json();
    if (!response.ok) {
      setToast({ type: 'error', message: data.error || 'No se pudo aprobar el gasto.' });
      return;
    }
    setToast({ type: 'success', message: 'Gasto aprobado correctamente.' });
    await loadExpenses();
  }

  async function handleReject(id: string, reason: string) {
    const response = await fetch(`/api/expenses/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const data = await response.json();
    if (!response.ok) {
      setToast({ type: 'error', message: data.error || 'No se pudo rechazar el gasto.' });
      return;
    }
    setToast({ type: 'warning', message: 'Gasto rechazado. El conductor verá el motivo.' });
    await loadExpenses();
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          toast.type === 'success' ? 'border-pos/30 bg-pos-tint text-pos'
          : toast.type === 'warning' ? 'border-warn/30 bg-warn-tint text-warn'
          : 'border-neg/30 bg-neg-tint text-neg'
        }`}>
          {toast.message}
        </div>
      ) : null}

      {loading ? (
        <div className="ticket p-5 text-sm text-ink-faint">Cargando gastos pendientes…</div>
      ) : error ? (
        <div className="rounded-2xl border border-neg/30 bg-neg-tint p-5 text-sm text-neg">{error}</div>
      ) : expenses.length === 0 ? (
        <div className="ticket overflow-hidden">
          <div className="ticket-band ticket-band-pos" />
          <div className="p-8 text-center">
            <p className="text-3xl">✓</p>
            <p className="font-display mt-3 text-xl font-bold text-ink">Todo al día</p>
            <p className="mt-1 text-sm text-ink-soft">No hay gastos esperando aprobación.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense, i) => (
            <PendingExpenseCard key={expense.id} expense={expense} index={i} onApprove={handleApprove} onReject={handleReject} />
          ))}
        </div>
      )}
    </div>
  );
}
