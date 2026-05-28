'use client';

import { useState, type FormEvent } from 'react';
import { formatCurrency } from '@/helpers/formatCurrency';

interface Props {
  initialDailyFee: number;
  initialExpenseLimit: number;
}

export default function DailyConfigForm({ initialDailyFee, initialExpenseLimit }: Props) {
  const [dailyFee, setDailyFee] = useState(initialDailyFee.toString());
  const [expenseLimit, setExpenseLimit] = useState(initialExpenseLimit.toString());
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const feeNum = Number(dailyFee.replace(/[^0-9.]/g, '')) || 0;
  const limitNum = Number(expenseLimit.replace(/[^0-9.]/g, '')) || 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const response = await fetch('/api/daily-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_fee: feeNum, expense_limit: limitNum }),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus('error');
      if (response.status === 401) {
        setMessage('Tu sesión expiró. Redirigiendo…');
        window.setTimeout(() => { window.location.href = '/'; }, 1200);
        return;
      }
      setMessage(data.error || 'No se pudo actualizar la configuración.');
      return;
    }

    setStatus('success');
    setMessage('Configuración guardada. Aplica solo a nuevos turnos.');
  }

  return (
    <form onSubmit={handleSubmit} className="reveal ticket overflow-hidden">
      <div className="ticket-band" />
      <div className="space-y-5 p-6">
        <div>
          <label className="label">Tarifa diaria (COP)</label>
          <div className="relative">
            <span className="money pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-ink-faint">$</span>
            <input inputMode="decimal" type="text" value={dailyFee} onChange={(e) => setDailyFee(e.target.value)} className="field field-amount pl-9" />
          </div>
          <p className="mt-1 font-mono text-[11px] text-ink-faint">{formatCurrency(feeNum)}</p>
        </div>

        <div>
          <label className="label">Límite de gasto automático (COP)</label>
          <div className="relative">
            <span className="money pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-ink-faint">$</span>
            <input inputMode="decimal" type="text" value={expenseLimit} onChange={(e) => setExpenseLimit(e.target.value)} className="field field-amount pl-9" />
          </div>
          <p className="mt-1 font-mono text-[11px] text-ink-faint">{formatCurrency(limitNum)}</p>
        </div>

        <div className="rounded-xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn">
          Los cambios aplican solo a los <b>nuevos turnos</b>. Los turnos ya abiertos conservan su tarifa.
        </div>

        <button type="submit" disabled={status === 'loading'} className="btn btn-primary w-full">
          {status === 'loading' ? 'Guardando…' : 'Guardar configuración'}
        </button>

        {message ? (
          <p className={`rounded-xl border px-4 py-3 text-sm font-medium ${status === 'success' ? 'border-pos/30 bg-pos-tint text-pos' : 'border-neg/30 bg-neg-tint text-neg'}`}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
