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
        setMessage('Tu sesión expiró. Redirigiendo a login…');
        window.setTimeout(() => { window.location.href = '/'; }, 1200);
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
    <form onSubmit={handleSubmit} className="reveal ticket overflow-hidden">
      <div className="ticket-band" />
      <div className="px-6 pt-6">
        <p className="eyebrow">Abrir turno</p>
        <h2 className="font-display mt-1 text-2xl font-bold text-ink">
          {userName ? `Buen turno, ${userName}` : 'Iniciar turno'}
        </h2>
        <p className="mt-1 text-sm text-ink-soft">Ingresa el recaudo bruto del día para comenzar.</p>
      </div>

      <div className="space-y-5 px-6 py-6">
        <div>
          <label htmlFor="income" className="label">Ingreso bruto del día (COP)</label>
          <div className="relative">
            <span className="money pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-ink-faint">$</span>
            <input
              id="income"
              inputMode="decimal"
              type="text"
              value={grossIncome}
              onChange={(e) => { setGrossIncome(e.target.value); setShowExistingShiftAction(false); }}
              placeholder="0"
              className="field field-amount pl-9"
            />
          </div>
        </div>

        <div className="tear" />

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-paper px-4 py-3">
            <p className="eyebrow">Tarifa de hoy</p>
            <p className="money mt-1 text-lg text-ink-soft">−{formatCurrency(dailyFee)}</p>
          </div>
          <div className="rounded-xl bg-marigold-tint px-4 py-3">
            <p className="eyebrow">Base post-tarifa</p>
            <p className={`money mt-1 text-lg ${basePostTarifa < 0 ? 'money-neg' : 'text-ink'}`}>{formatCurrency(basePostTarifa)}</p>
          </div>
        </div>

        <button type="submit" disabled={status === 'loading' || numericGross <= 0} className="btn btn-primary w-full">
          {status === 'loading' ? 'Creando turno…' : 'Confirmar turno'}
        </button>

        {message ? (
          <div className={`rounded-xl border px-4 py-3 text-sm ${
            status === 'success' ? 'border-pos/30 bg-pos-tint text-pos'
            : status === 'warning' ? 'border-warn/30 bg-warn-tint text-warn'
            : 'border-neg/30 bg-neg-tint text-neg'
          }`}>
            <p className="font-medium">{message}</p>
            {showExistingShiftAction ? (
              <button type="button" onClick={() => window.location.reload()} className="btn btn-ghost mt-3 min-h-[40px]">
                Ver mi turno
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </form>
  );
}
