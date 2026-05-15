'use client';

import { useState } from 'react';

interface Props {
  shiftId: string;
}

export default function CloseShiftPanel({ shiftId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingInfo, setPendingInfo] = useState<{ pendingCount: number; pendingTotal: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClose(force = false) {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/shifts/${shiftId}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'No se pudo cerrar el turno.');
        return;
      }

      if (data.requiresConfirmation) {
        setPendingInfo({ pendingCount: data.pendingCount ?? 0, pendingTotal: data.pendingTotal ?? 0 });
        return;
      }

      if (data.receipt) {
        setMessage('Turno cerrado correctamente. Redirigiendo al comprobante...');
        window.setTimeout(() => {
          window.location.reload();
        }, 800);
        return;
      }

      setError('Respuesta inesperada del servidor.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[20px] border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Cierre financiero</p>
          <h2 className="mt-2 text-xl font-semibold text-stone-900">Cerrar este turno</h2>
        </div>
        <button
          type="button"
          onClick={() => handleClose(false)}
          disabled={loading}
          className="inline-flex min-h-[48px] items-center justify-center rounded-3xl bg-amber-600 px-5 text-base font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70 no-print"
        >
          {loading ? 'Procesando...' : 'Cerrar turno'}
        </button>
      </div>

      <p className="mt-4 text-sm text-stone-600">
        El cierre se ejecuta en el servidor. Si hay gastos pendientes, te pedirá confirmación antes de excluirlos del cálculo.
      </p>

      {pendingInfo ? (
        <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Advertencia:</p>
          <p>Hay {pendingInfo.pendingCount} gasto(s) pendiente(s) por un total de {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(pendingInfo.pendingTotal)}.</p>
          <p>Si cierras ahora, estos gastos quedarán excluidos del cálculo final.</p>
          <div className="mt-4 flex gap-3 flex-col sm:flex-row">
            <button
              type="button"
              onClick={() => handleClose(true)}
              disabled={loading}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-3xl bg-emerald-600 px-4 text-base font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Confirmar cierre
            </button>
            <button
              type="button"
              onClick={() => setPendingInfo(null)}
              disabled={loading}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-3xl border border-stone-300 bg-white px-4 text-base font-semibold text-stone-900 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Esperar revisión
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
