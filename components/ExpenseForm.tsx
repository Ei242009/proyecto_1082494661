'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { formatCurrency } from '@/helpers/formatCurrency';

interface Props {
  shiftId: string;
  expenseLimit: number;
  onSaved?: () => void;
}

const ico = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    {d.split('|').map((p, i) => <path key={i} d={p} />)}
  </svg>
);

// Valores en minúscula EXACTOS al CHECK de la BD / Zod.
const CATEGORIES: { value: string; label: string; icon: ReactNode }[] = [
  { value: 'combustible', label: 'Combustible', icon: ico('M14 20V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14|M4 20h10|M14 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3') },
  { value: 'peaje', label: 'Peaje', icon: ico('M4 20h16|M6 20V8l6-4 6 4v12|M10 20v-5h4v5') },
  { value: 'lavado', label: 'Lavado', icon: ico('M7 11V6a2 2 0 0 1 4 0|M8 11h9a2 2 0 0 1 2 2v1H6v-1a2 2 0 0 1 2-2Z|M7 18v2|M11 18v2|M15 18v2') },
  { value: 'reparacion', label: 'Reparación', icon: ico('M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.3 2.3-2-2 2.3-2.3Z') },
  { value: 'otro', label: 'Otro', icon: ico('M5 4h11l3 3v13H5z|M9 12h6|M9 16h4') },
];

export default function ExpenseForm({ shiftId, expenseLimit, onSaved }: Props) {
  const [category, setCategory] = useState('combustible');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  const numericAmount = useMemo(() => {
    const cleaned = amount.replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : 0;
  }, [amount]);

  const overLimit = numericAmount > expenseLimit;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setToast(null);

    if (numericAmount <= 0) {
      setToast({ type: 'error', message: 'Ingresa un monto válido mayor que cero.' });
      setLoading(false);
      return;
    }
    if (description.trim().length < 3) {
      setToast({ type: 'error', message: 'La descripción debe tener al menos 3 caracteres.' });
      setLoading(false);
      return;
    }

    const response = await fetch(`/api/shift/${shiftId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, amount: numericAmount, description }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      if (response.status === 401) {
        setToast({ type: 'error', message: 'Tu sesión expiró. Redirigiendo…' });
        window.setTimeout(() => { window.location.href = '/'; }, 1200);
        return;
      }
      if (response.status === 409) {
        setToast({ type: 'warning', message: 'Este turno ya fue cerrado. No puedes agregar más gastos.' });
        return;
      }
      if (response.status === 403) {
        setToast({ type: 'error', message: 'No tienes permiso para esta acción.' });
        return;
      }
      setToast({ type: 'error', message: data.error || 'No se pudo registrar el gasto.' });
      return;
    }

    setToast(
      data.status === 'APROBADO'
        ? { type: 'success', message: '✓ Gasto registrado y aprobado automáticamente.' }
        : { type: 'warning', message: '⏳ Gasto enviado a revisión de la propietaria.' },
    );

    setAmount('');
    setDescription('');
    setCategory('combustible');
    onSaved?.();
    window.setTimeout(() => setToast(null), 4500);
  }

  return (
    <form onSubmit={handleSubmit} className="reveal ticket overflow-hidden">
      <div className="ticket-band" />
      <div className="px-6 pt-6">
        <p className="eyebrow">Nuevo gasto</p>
        <h2 className="font-display mt-1 text-2xl font-bold text-ink">Registrar gasto</h2>
      </div>

      <div className="space-y-5 px-6 py-6">
        {/* Selector de categoría con íconos */}
        <div>
          <p className="label">Categoría</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {CATEGORIES.map((c) => {
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border px-1 py-2 transition ${
                    active
                      ? 'border-marigold bg-marigold-tint text-marigold-deep shadow-[inset_0_0_0_1px_var(--color-marigold)]'
                      : 'border-line-strong bg-paper-2 text-ink-soft hover:border-marigold'
                  }`}
                >
                  {c.icon}
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wide leading-none text-center">{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="expense-amount" className="label">Monto (COP)</label>
          <div className="relative">
            <span className="money pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-ink-faint">$</span>
            <input
              id="expense-amount"
              inputMode="decimal"
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="field field-amount pl-9"
            />
          </div>
        </div>

        <div>
          <label htmlFor="expense-description" className="label">Descripción</label>
          <textarea
            id="expense-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej.: Tanqueo en la ruta 4"
            rows={2}
            className="field"
          />
        </div>

        {overLimit ? (
          <div className="rounded-xl border border-warn/40 bg-warn-tint px-4 py-3 text-sm font-medium text-warn">
            Supera el límite de {formatCurrency(expenseLimit)} → quedará <b>PENDIENTE</b> de aprobación.
          </div>
        ) : (
          <p className="text-center font-mono text-[11px] uppercase tracking-widest text-ink-faint">
            Límite automático: {formatCurrency(expenseLimit)}
          </p>
        )}

        <button type="submit" disabled={loading || numericAmount <= 0 || description.trim().length < 3} className="btn btn-primary w-full">
          {loading ? 'Guardando…' : 'Guardar gasto'}
        </button>

        {toast ? (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            toast.type === 'success' ? 'border-pos/30 bg-pos-tint text-pos'
            : toast.type === 'warning' ? 'border-warn/30 bg-warn-tint text-warn'
            : 'border-neg/30 bg-neg-tint text-neg'
          }`}>
            {toast.message}
          </div>
        ) : null}
      </div>
    </form>
  );
}
