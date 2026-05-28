'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuditEntry } from '@/lib/types';

const ACTION_LABEL: Record<string, string> = {
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  create_shift: 'Turno creado',
  close_shift: 'Turno cerrado',
  add_expense: 'Gasto agregado',
  approve_expense: 'Gasto aprobado',
  reject_expense: 'Gasto rechazado',
  update_config: 'Config actualizada',
  create_user: 'Usuario creado',
  toggle_user: 'Usuario activado/suspendido',
  change_password: 'Cambio de contraseña',
  bootstrap: 'Bootstrap',
};

function currentMonthInput() {
  const d = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(new Date());
  return d.slice(0, 7); // YYYY-MM
}

export default function AuditLogPage() {
  const [month, setMonth] = useState(currentMonthInput());
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/audit-log?month=${month}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('No se pudo cargar la bitácora');
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { void load(); }, [load]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-5xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Auditoría técnica</p>
          <h1 className="font-display text-3xl font-extrabold text-ink">Bitácora</h1>
        </div>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="field w-auto" />
      </div>

      {loading ? (
        <div className="ticket p-6 text-sm text-ink-faint">Cargando bitácora…</div>
      ) : error ? (
        <div className="rounded-2xl border border-neg/30 bg-neg-tint p-5 text-sm text-neg">{error}</div>
      ) : entries.length === 0 ? (
        <div className="ticket p-6 text-center text-sm text-ink-soft">Sin operaciones registradas en este mes.</div>
      ) : (
        <div className="ticket divide-y divide-line overflow-hidden">
          {entries.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{e.summary}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink-faint">
                  {ACTION_LABEL[e.action] ?? e.action}{e.user_email ? ` · ${e.user_email}` : ''}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-ink-faint">
                {e.timestamp ? new Date(e.timestamp).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) : ''}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
