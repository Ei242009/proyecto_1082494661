'use client';

import { useState, type FormEvent } from 'react';

interface Props {
  initialDailyFee: number;
  initialExpenseLimit: number;
}

export default function DailyConfigForm({ initialDailyFee, initialExpenseLimit }: Props) {
  const [dailyFee, setDailyFee] = useState(initialDailyFee.toString());
  const [expenseLimit, setExpenseLimit] = useState(initialExpenseLimit.toString());
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const body = {
      daily_fee: Number(dailyFee.replace(/[^0-9.]/g, '')),
      expense_limit: Number(expenseLimit.replace(/[^0-9.]/g, '')),
    };

    const response = await fetch('/api/daily-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus('error');
      if (response.status === 401) {
        setMessage('Tu sesión expiró. Redirigiendo a login...');
        window.setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }
      setMessage(data.error || 'No se pudo actualizar la configuración.');
      return;
    }

    setStatus('success');
    setMessage('Configuración guardada. Los cambios aplican solo a nuevos turnos.');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Tarifa diaria</p>
        <input
          inputMode="decimal"
          type="text"
          value={dailyFee}
          onChange={(event) => setDailyFee(event.target.value)}
          className="mt-3 w-full rounded-3xl border border-stone-300 bg-stone-50 px-4 py-4 text-2xl font-semibold text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
        />
      </div>

      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Límite de gasto</p>
        <input
          inputMode="decimal"
          type="text"
          value={expenseLimit}
          onChange={(event) => setExpenseLimit(event.target.value)}
          className="mt-3 w-full rounded-3xl border border-stone-300 bg-stone-50 px-4 py-4 text-2xl font-semibold text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
        />
      </div>

      <div className="rounded-3xl bg-amber-50 p-4 text-sm text-stone-700">
        <p className="font-semibold text-amber-900">Aviso importante</p>
        <p className="mt-2">Los cambios aplican solo a los nuevos turnos. Los turnos ya abiertos conservan la tarifa anterior.</p>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-3xl bg-amber-600 px-4 text-base font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? 'Guardando...' : 'Guardar configuración'}
      </button>

      {message ? (
        <p className={`rounded-3xl border px-4 py-3 text-sm ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
