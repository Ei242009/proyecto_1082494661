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
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-px flex-1 bg-line-strong" />
          <p className="eyebrow">Gastos del turno</p>
          <span className="h-px flex-1 bg-line-strong" />
        </div>
        <ExpenseHistory shiftId={shiftId} refreshKey={refreshKey} />
      </section>
    </div>
  );
}
