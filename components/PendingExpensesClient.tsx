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
          setToast({ type: 'error', message: 'Tu sesión expiró. Redirigiendo a login...' });
          window.setTimeout(() => {
            window.location.href = '/login';
          }, 1200);
          return;
        }
        throw new Error(data.error || 'No se pudo obtener la lista de gastos pendientes.');
      }
      setExpenses(data.expenses ?? []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  async function handleApprove(id: string) {
    const response = await fetch(`/api/expenses/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        setToast({ type: 'error', message: 'Tu sesión expiró. Redirigiendo a login...' });
        window.setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }
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
      if (response.status === 401) {
        setToast({ type: 'error', message: 'Tu sesión expiró. Redirigiendo a login...' });
        window.setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }
      setToast({ type: 'error', message: data.error || 'No se pudo rechazar el gasto.' });
      return;
    }

    setToast({ type: 'warning', message: 'Gasto rechazado. El conductor verá el motivo.' });
    await loadExpenses();
  }

  return (
    <div className="space-y-4">
      {toast ? (
        <div
          className={`rounded-3xl border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : toast.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[20px] border border-stone-200 bg-white p-5 text-sm text-stone-500 shadow-sm">
          Cargando gastos pendientes...
        </div>
      ) : error ? (
        <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
          {error}
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-[20px] border border-stone-200 bg-white p-5 text-center shadow-sm">
          <div className="text-2xl">✓</div>
          <p className="mt-2 text-sm font-medium text-stone-700">No hay gastos esperando aprobación.</p>
          <p className="mt-1 text-xs text-stone-500">Todo está al día.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <PendingExpenseCard
              key={expense.id}
              expense={expense}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
