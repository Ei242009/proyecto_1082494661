'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AuditShiftRow } from '@/types/client';
import { formatCurrency } from '@/helpers/formatCurrency';

export default function AuditPage() {
  const [shifts, setShifts] = useState<AuditShiftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('from', fromDate);
      if (toDate) params.append('to', toDate);

      const response = await fetch(`/api/audit?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 401) {
          setError('Tu sesión expiró. Redirigiendo a login...');
          window.setTimeout(() => {
            window.location.href = '/login';
          }, 1200);
          return;
        }
        throw new Error('Failed to fetch audit data');
      }
      const data: AuditShiftRow[] = await response.json();
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    void fetchShifts();
  }, [fetchShifts]);

  const handleFilter = () => {
    void fetchShifts();
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm text-center">
          <p className="text-sm text-stone-600">Cargando auditoría...</p>
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
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Auditoría</p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">Verificación de Turnos</h1>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Desde
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-stone-300 rounded-3xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Hasta
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-stone-300 rounded-3xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-amber-100 focus:border-amber-500"
            />
          </div>
          <button
            onClick={handleFilter}
            className="inline-flex min-h-[48px] items-center justify-center rounded-3xl bg-amber-600 px-6 text-base font-semibold text-white transition hover:bg-amber-700 w-full sm:w-auto"
          >
            Filtrar
          </button>
        </div>
      </section>

      {/* Shifts Table / List */}
      <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm overflow-x-auto">
        {shifts.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm font-medium text-stone-700">Aún no hay turnos cerrados para auditar en el período seleccionado.</p>
            <p className="mt-2 text-xs text-stone-500">Los turnos aparecen aquí cuando la propietaria los cierra.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-stone-200 bg-stone-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">Fecha</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-stone-700 uppercase tracking-wider">Conductor</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-stone-700 uppercase tracking-wider">IB</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-stone-700 uppercase tracking-wider">Tarifa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {shifts.map((shift, index) => (
                <tr key={index} className="hover:bg-stone-50">
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-stone-900">{shift.date}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-stone-900">{shift.conductor_name}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-stone-900 font-semibold">{formatCurrency(shift.gross_income)}</td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-right text-stone-900 font-semibold">{formatCurrency(shift.daily_fee_snapshot)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
                        {formatCurrency(shift.gross_income)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(shift.daily_fee_snapshot)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          shift.status === 'CERRADO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {shift.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}