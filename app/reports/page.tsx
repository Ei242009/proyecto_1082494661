'use client';

import { useState, useEffect, useCallback } from 'react';
import type { DashboardData } from '@/types/client';
import { formatCurrency } from '@/helpers/formatCurrency';

interface KpiCardProps {
  title: string;
  value: string;
  color: 'green' | 'red' | 'blue' | 'gray';
}

function KpiCard({ title, value, color }: KpiCardProps) {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    gray: 'text-gray-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <p className={`text-2xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
}

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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Reportes Financieros</h1>
          <div className="text-center">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Reportes Financieros</h1>
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Reportes Financieros</h1>

        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        {data && data.closedShiftsCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <KpiCard
              title="Ingresos Brutos Totales"
              value={formatCurrency(data.totalGrossIncome)}
              color="blue"
            />
            <KpiCard
              title="Tarifas Diarias Cobradas"
              value={formatCurrency(data.totalDailyFee)}
              color="blue"
            />
            <KpiCard
              title="Gastos Aprobados"
              value={formatCurrency(data.totalApprovedExpenses)}
              color="red"
            />
            <KpiCard
              title="Utilidad Neta Acumulada"
              value={formatCurrency(data.netIncome)}
              color={data.netIncome >= 0 ? 'green' : 'red'}
            />
            <KpiCard
              title="Turnos Cerrados"
              value={data.closedShiftsCount.toString()}
              color="gray"
            />
            <KpiCard
              title="Gastos Pendientes"
              value={data.pendingExpensesCount.toString()}
              color="red"
            />
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center mb-8">
            <div className="text-4xl text-gray-300 mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay turnos cerrados en este período</h3>
            <p className="text-sm text-gray-500">Los datos aparecen aquí cuando la propietaria cierra los turnos.</p>
          </div>
        )}

        {/* Placeholder for future table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalle de Turnos</h2>
          <p className="text-gray-500">Tabla de turnos del período próximamente...</p>
        </div>
      </div>
    </div>
  );
}