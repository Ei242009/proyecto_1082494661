import type { AuditShiftRow } from '@/types/client';

async function fetchAudit() {
  const response = await fetch('/api/audit', { cache: 'no-store' });
  if (!response.ok) return [];
  const json = await response.json();
  return json.data as AuditShiftRow[] || [];
}

export default async function AuditPage() {
  const auditItems = await fetchAudit();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Auditoría</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">Turnos cerrados</h1>
        <div className="mt-6 space-y-4">
          {auditItems.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
              No hay datos de auditoría disponibles.
            </div>
          ) : (
            auditItems.map((item: AuditShiftRow, index: number) => (
              <div key={index} className="rounded-3xl border border-stone-200 bg-amber-50 p-4">
                <p className="text-sm text-stone-500">{item.date}</p>
                <p className="mt-2 text-lg font-semibold text-stone-900">{item.conductor_name}</p>
                <p className="mt-1 text-sm text-stone-700">Ingreso bruto: {formatCurrency(item.gross_income)}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
