'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/helpers/formatCurrency';
import type { Expense } from '@/types/client';

interface Props {
  shiftId: string;
  refreshKey: number;
}

const statusClasses: Record<Expense['status'], string> = {
  APROBADO: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  PENDIENTE: 'border-amber-200 bg-amber-50 text-amber-700',
  RECHAZADO: 'border-rose-200 bg-rose-50 text-rose-700',
};

export default function ExpenseHistory({ shiftId, refreshKey }: Props) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadExpenses = async () => {
      if (!mounted) return;
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/shift/${shiftId}/expenses`, { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            if (!mounted) return;
            setError('Sesión expirada. Redirigiendo a login...');
            setLoading(false);
            window.setTimeout(() => {
              window.location.href = '/login';
            }, 1200);
            return;
          }
          throw new Error(data.error || 'No se pudieron cargar los gastos');
        }

        if (!mounted) return;
        setExpenses(data.expenses ?? []);
      } catch (error) {
        if (!mounted) return;
        setError(error instanceof Error ? error.message : 'Error inesperado');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    void loadExpenses();

    return () => {
      mounted = false;
    };
  }, [shiftId, refreshKey]);

  if (loading) {
    return (
      <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-stone-500">Cargando gastos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-stone-500">Todavía no hay gastos registrados en este turno.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <article key={expense.id} className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-stone-500">{expense.category}</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">{formatCurrency(expense.amount)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[expense.status]}`}>
              {expense.status}
            </span>
          </div>

          <p className="mt-4 text-sm text-stone-600">{expense.description}</p>

          {expense.status === 'RECHAZADO' && expense.rejection_reason ? (
            <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Motivo: {expense.rejection_reason}
            </div>
          ) : null}

          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-stone-400">
            Registrado el {new Date(expense.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        </article>
      ))}
    </div>
  );
}
