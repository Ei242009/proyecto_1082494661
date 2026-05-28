'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '@/types/client';
import { formatCurrency } from '@/helpers/formatCurrency';

const PERIODS = [
  { key: 'day', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
] as const;

export default function ReportsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard?period=${period}`, { cache: 'no-store' });
      if (!response.ok) {
        if (response.status === 401) {
          setError('Tu sesión expiró. Redirigiendo…');
          window.setTimeout(() => { window.location.href = '/'; }, 1200);
          return;
        }
        throw new Error('No se pudieron cargar los reportes');
      }
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const rows: { label: string; value: string; tone?: 'pos' | 'neg' | 'warn' }[] = data
    ? [
        { label: 'Ingresos brutos', value: formatCurrency(data.totalGrossIncome) },
        { label: 'Tarifas cobradas', value: formatCurrency(data.totalDailyFee) },
        { label: 'Gastos aprobados', value: formatCurrency(data.totalApprovedExpenses) },
        { label: 'Turnos cerrados', value: String(data.closedShiftsCount) },
        { label: 'Gastos pendientes', value: String(data.pendingExpensesCount), tone: data.pendingExpensesCount > 0 ? 'warn' : undefined },
      ]
    : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <p className="eyebrow">Reportes</p>
        <h1 className="font-display text-3xl font-extrabold text-ink">Financieros</h1>
      </div>

      {/* Selector de período tipo billete */}
      <div className="mb-5 inline-flex rounded-xl border border-line-strong bg-paper-2 p-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`rounded-lg px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide transition ${
              period === p.key ? 'bg-marigold text-white shadow' : 'text-ink-soft hover:text-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ticket p-6 text-sm text-ink-faint">Cargando…</div>
      ) : error ? (
        <div className="rounded-2xl border border-neg/30 bg-neg-tint p-5 text-sm text-neg">{error}</div>
      ) : data && data.closedShiftsCount > 0 ? (
        <div className="space-y-4">
          <section className="reveal ticket overflow-hidden" style={{ ['--i' as string]: 0 }}>
            <div className={data.netIncome < 0 ? 'ticket-band ticket-band-ink' : 'ticket-band ticket-band-pos'} />
            <div className="p-6 text-center">
              <p className="eyebrow">Utilidad neta del período</p>
              <p className={`money mt-1 text-5xl ${data.netIncome < 0 ? 'money-neg' : 'money-pos'}`}>
                {formatCurrency(data.netIncome)}
              </p>
            </div>
          </section>

          <section className="reveal ticket divide-y divide-line" style={{ ['--i' as string]: 1 }}>
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm text-ink-soft">{r.label}</span>
                <span className={`money text-base ${r.tone === 'warn' ? 'text-warn' : 'text-ink'}`}>{r.value}</span>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <section className="ticket overflow-hidden">
          <div className="ticket-band" />
          <div className="p-8 text-center">
            <p className="text-3xl">📊</p>
            <p className="font-display mt-3 text-xl font-bold text-ink">Sin turnos cerrados</p>
            <p className="mt-1 text-sm text-ink-soft">Los datos aparecen cuando la propietaria cierra turnos en este período.</p>
          </div>
        </section>
      )}
    </main>
  );
}
