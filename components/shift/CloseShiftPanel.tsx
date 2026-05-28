'use client';

import { useState } from 'react';
import { formatCurrency } from '@/helpers/formatCurrency';

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
        setMessage('Turno cerrado. Generando comprobante…');
        window.setTimeout(() => window.location.reload(), 800);
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
    <div className="reveal ticket overflow-hidden no-print" style={{ ['--i' as string]: 1 }}>
      <div className="ticket-band ticket-band-ink" />
      <div className="p-6">
        <p className="eyebrow">Cierre financiero</p>
        <h2 className="font-display mt-1 text-xl font-bold text-ink">Cerrar y liquidar turno</h2>
        <p className="mt-2 text-sm text-ink-soft">
          El cálculo se ejecuta en el servidor. Si hay gastos pendientes, te pediremos confirmación antes de excluirlos.
        </p>

        {!pendingInfo ? (
          <button type="button" onClick={() => handleClose(false)} disabled={loading} className="btn btn-primary mt-5 w-full">
            {loading ? 'Procesando…' : 'Cerrar turno'}
          </button>
        ) : (
          <div className="mt-5 rounded-xl border border-warn/30 bg-warn-tint p-4 text-sm text-warn">
            <p className="font-bold">Hay {pendingInfo.pendingCount} gasto(s) pendiente(s)</p>
            <p className="mt-1">Total {formatCurrency(pendingInfo.pendingTotal)}. Si cierras ahora, quedarán excluidos del cálculo.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleClose(true)} disabled={loading} className="btn btn-pos">Cerrar igual</button>
              <button type="button" onClick={() => setPendingInfo(null)} disabled={loading} className="btn btn-ghost">Esperar</button>
            </div>
          </div>
        )}

        {message ? <div className="mt-4 rounded-xl border border-pos/30 bg-pos-tint px-4 py-3 text-sm text-pos">{message}</div> : null}
        {error ? <div className="mt-4 rounded-xl border border-neg/30 bg-neg-tint px-4 py-3 text-sm text-neg">{error}</div> : null}
      </div>
    </div>
  );
}
