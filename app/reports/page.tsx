'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '@/types/client';
import { formatCurrency } from '@/helpers/formatCurrency';

export default function ReportsPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard?period=${period}`);
      if (!response.ok) {
        if (response.status === 401) {
          setError('Tu sesión expiró. Redirigiendo a login...');
          window.setTimeout(() => {
            window.location.href = '/login';
          }, 1200);
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }
      const dashboardData: DashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const periodLabels = {
    day: 'Hoy',
    week: 'Esta semana',
    month: 'Este mes',
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm text-center">
          <p className="text-sm text-stone-600">Cargando reportes...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="rounded-[20px] border border-rose-200 bg-rose-50 p-5 shadow-sm">
          <p className="text-sm text-rose-700">Error: {error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <section className="mb-6 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Reportes</p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">Financieros</h1>
        </div>
      </section>

      {/* Period Selector */}
      <section className="mb-6 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-3 rounded-3xl text-sm font-semibold transition ${
                period === p
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </section>

      {/* KPIs */}
      {data && data.closedShiftsCount > 0 ? (
        <section className="mb-6 grid gap-3">
          <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Ingresos Brutos Totales</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{formatCurrency(data.totalGrossIncome)}</p>
          </div>
          <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Tarifas Diarias Cobradas</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{formatCurrency(data.totalDailyFee)}</p>
          </div>
          <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Gastos Aprobados</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{formatCurrency(data.totalApprovedExpenses)}</p>
          </div>
          <div className={`rounded-[20px] border p-4 shadow-sm ${data.netIncome >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Utilidad Neta Acumulada</p>
            <p className={`mt-2 text-2xl font-semibold ${data.netIncome >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(data.netIncome)}</p>
          </div>
          <div className="rounded-[20px] border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Turnos Cerrados</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{data.closedShiftsCount}</p>
          </div>
          <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Gastos Pendientes</p>
            <p className="mt-2 text-2xl font-semibold text-amber-900">{data.pendingExpensesCount}</p>
          </div>
        </section>
      ) : (
        <section className="mb-6 rounded-[20px] border border-stone-200 bg-white p-6 shadow-sm text-center">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-base font-medium text-stone-900 mb-2">No hay turnos cerrados en este período</h3>
          <p className="text-sm text-stone-500">Los datos aparecen aquí cuando la propietaria cierra los turnos.</p>
        </section>
      )}
    </main>
  );
}