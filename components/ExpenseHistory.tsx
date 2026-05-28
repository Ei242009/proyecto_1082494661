'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/helpers/formatCurrency';
import type { Expense } from '@/types/client';

interface Props {
  shiftId: string;
  refreshKey: number;
}

const badgeClass: Record<Expense['status'], string> = {
  APROBADO: 'badge badge-pos',
  PENDIENTE: 'badge badge-warn',
  RECHAZADO: 'badge badge-neg',
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
            setError('Sesión expirada. Redirigiendo…');
            setLoading(false);
            window.setTimeout(() => { window.location.href = '/'; }, 1200);
            return;
          }
          throw new Error(data.error || 'No se pudieron cargar los gastos');
        }
        if (!mounted) return;
        setExpenses(data.expenses ?? []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Error inesperado');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void loadExpenses();
    return () => { mounted = false; };
  }, [shiftId, refreshKey]);

  if (loading) {
    return <div className="ticket p-5 text-sm text-ink-faint">Cargando gastos…</div>;
  }
  if (error) {
    return <div className="rounded-2xl border border-neg/30 bg-neg-tint p-5 text-sm text-neg">{error}</div>;
  }
  if (expenses.length === 0) {
    return (
      <div className="ticket p-6 text-center">
        <p className="font-mono text-3xl text-line-strong">∅</p>
        <p className="mt-2 text-sm text-ink-soft">Todavía no hay gastos en este turno.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense, idx) => (
        <article key={expense.id} className="reveal ticket flex items-center justify-between gap-4 p-4" style={{ ['--i' as string]: idx }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wide text-ink-faint">{expense.category}</span>
              <span className={badgeClass[expense.status]}>{expense.status}</span>
            </div>
            <p className="mt-1 truncate text-sm text-ink-soft">{expense.description}</p>
            {expense.status === 'RECHAZADO' && expense.rejection_reason ? (
              <p className="mt-1 text-xs text-neg">Motivo: {expense.rejection_reason}</p>
            ) : null}
          </div>
          <p className={`money shrink-0 text-lg ${expense.status === 'RECHAZADO' ? 'text-ink-faint line-through' : 'text-ink'}`}>
            −{formatCurrency(expense.amount)}
          </p>
        </article>
      ))}
    </div>
  );
}
