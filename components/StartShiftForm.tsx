'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { formatCurrency } from '@/helpers/formatCurrency';

interface Props {
  dailyFee: number;
  userName?: string;
}

export default function StartShiftForm({ dailyFee, userName }: Props) {
  const [grossIncome, setGrossIncome] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'warning' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showExistingShiftAction, setShowExistingShiftAction] = useState(false);

  const numericGross = useMemo(() => {
    const cleaned = grossIncome.replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : 0;
  }, [grossIncome]);

  const basePostTarifa = numericGross - dailyFee;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    setShowExistingShiftAction(false);

    const response = await fetch('/api/shift/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gross_income: numericGross }),
    });

    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        setStatus('error');
        setMessage('Tu sesión expiró. Redirigiendo a login...');
        window.setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }

      if (data.error === 'SHIFT_EXISTS') {
        setStatus('warning');
        setShowExistingShiftAction(true);
        setMessage('Ya tienes un turno abierto hoy.');
        return;
      }

      setStatus('error');
      setMessage(data.error || 'No se pudo crear el turno.');
      return;
    }

    setStatus('success');
    setMessage('Turno creado correctamente.');
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
      {userName ? (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-stone-900">Buenos días, {userName}.</h2>
          <p className="text-sm text-stone-600">Ingresa el recaudo del turno de hoy para empezar.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-stone-900">Iniciar turno</h2>
          <p className="text-sm text-stone-600">Ingresa el Ingreso Bruto para comenzar. El teclado numérico aparecerá automáticamente.</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="income" className="block text-sm font-medium text-stone-700">
          Ingreso bruto del día
        </label>
        <input
          id="income"
          inputMode="decimal"
          type="text"
          value={grossIncome}
          onChange={(event) => {
            setGrossIncome(event.target.value);
            setShowExistingShiftAction(false);
          }}
          placeholder="0"
          className="w-full rounded-3xl border border-stone-300 bg-stone-50 px-4 py-4 text-2xl font-semibold text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
        />
      </div>

      <div className="rounded-3xl bg-stone-50 p-4">
        <p className="text-sm text-stone-500">Tarifa de hoy</p>
        <p className="mt-2 text-xl font-semibold text-stone-900">{formatCurrency(dailyFee)}</p>
      </div>

      <div className="rounded-3xl bg-amber-50 p-4">
        <p className="text-sm text-stone-500">Base post-tarifa</p>
        <p className="mt-2 text-lg font-semibold text-stone-900">
          {formatCurrency(numericGross)} - {formatCurrency(dailyFee)} = {formatCurrency(basePostTarifa)}
        </p>
      </div>

      <button
        type="submit"
        disabled={status === 'loading' || numericGross <= 0}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-3xl bg-amber-600 px-4 text-base font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === 'loading' ? 'Creando turno...' : 'Confirmar turno'}
      </button>

      {message ? (
        <div className={`rounded-3xl border px-4 py-3 text-sm ${
          status === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : status === 'warning'
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-rose-200 bg-rose-50 text-rose-700'
        }`}>
          <p>{message}</p>
          {showExistingShiftAction ? (
            <button
              type="button"
              onClick={() => (window.location.href = '/turno')}
              className="mt-3 inline-flex min-h-[40px] items-center justify-center rounded-3xl border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-200"
            >
              Ir al turno existente
            </button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
