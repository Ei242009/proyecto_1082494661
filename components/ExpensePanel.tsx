'use client';

import { useState } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseHistory from './ExpenseHistory';

interface Props {
  shiftId: string;
  expenseLimit: number;
}

export default function ExpensePanel({ shiftId, expenseLimit }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <ExpenseForm
        shiftId={shiftId}
        expenseLimit={expenseLimit}
        onSaved={() => setRefreshKey((current) => current + 1)}
      />
      <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Historial</p>
            <h2 className="mt-2 text-xl font-semibold text-stone-900">Gastos de este turno</h2>
          </div>
        </div>
        <div className="mt-5">
          <ExpenseHistory shiftId={shiftId} refreshKey={refreshKey} />
        </div>
      </section>
    </div>
  );
}
