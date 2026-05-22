'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { formatCurrency } from '@/helpers/formatCurrency';

interface Props {
  shiftId: string;
  expenseLimit: number;
  onSaved?: () => void;
}

const categories = ['Combustible', 'Peaje', 'Lavado', 'Otro'];

export default function ExpenseForm({ shiftId, expenseLimit, onSaved }: Props) {
  const [category, setCategory] = useState('Combustible');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'warning' | 'error'; message: string } | null>(null);

  const numericAmount = useMemo(() => {
    const cleaned = amount.replace(/[^0-9.]/g, '');
    return cleaned ? Number(cleaned) : 0;
  }, [amount]);

  const overLimit = numericAmount > expenseLimit;
  const warningMessage = overLimit
    ? `Este monto supera el límite de ${formatCurrency(expenseLimit)} y requerirá aprobación de la propietaria.`
    : null;

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
        setToast({ type: 'error', message: 'Tu sesión expiró. Redirigiendo a login...' });
        window.setTimeout(() => {
          window.location.href = '/login';
        }, 1200);
        return;
      }

      if (response.status === 409 && (data.error === 'SHIFT_CLOSED' || data.error === 'Shift closed')) {
        setToast({ type: 'warning', message: 'Este turno ya fue cerrado. No puedes agregar más gastos.' });
        return;
      }

      if (response.status === 403) {
        setToast({ type: 'error', message: 'No tienes permiso para realizar esta acción.' });
        return;
      }

      setToast({ type: 'error', message: data.error || 'No se pudo registrar el gasto.' });
      return;
    }

    if (data.status === 'APROBADO') {
      setToast({ type: 'success', message: '✓ Gasto registrado.' });
    } else {
      setToast({ type: 'warning', message: '⏳ Gasto enviado a revisión. La propietaria debe aprobarlo.' });
    }

    setAmount('');
    setDescription('');
    setCategory('Combustible');
    onSaved?.();

    window.setTimeout(() => setToast(null), 4500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-stone-900">Registrar gasto</h2>
        <p className="text-sm text-stone-600">Este formulario está pensado para el celular: monto rápido, categoría y descripción clara.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-stone-700">
          Categoría
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
          >
            {categories.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label htmlFor="expense-amount" className="block text-sm font-medium text-stone-700">
          Monto
          <input
            id="expense-amount"
            inputMode="decimal"
            type="text"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0"
            className="mt-2 w-full rounded-3xl border border-stone-300 bg-stone-50 px-4 py-4 text-2xl font-semibold text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
          />
        </label>
      </div>

      <label htmlFor="expense-description" className="block text-sm font-medium text-stone-700">
        Descripción
        <textarea
          id="expense-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Ejemplo: Combustible ruta 4"
          rows={4}
          className="mt-2 w-full rounded-3xl border border-stone-300 bg-stone-50 px-4 py-3 text-base text-stone-900 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
        />
      </label>

      {warningMessage ? (
        <div className="rounded-3xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
          {warningMessage}
        </div>
      ) : null}

      <div className="rounded-3xl bg-slate-50 p-4 text-sm text-stone-600">
        Límite actual: <span className="font-semibold text-stone-900">{formatCurrency(expenseLimit)}</span>
      </div>

      <button
        type="submit"
        disabled={loading || numericAmount <= 0 || description.trim().length < 3}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-3xl bg-amber-600 px-4 text-base font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Registrando gasto...' : 'Guardar gasto'}
      </button>

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
    </form>
  );
}
