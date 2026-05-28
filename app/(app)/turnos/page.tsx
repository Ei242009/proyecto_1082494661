import Link from 'next/link';
import { getShifts, getUsers } from '@/lib/dataService';
import { formatCurrency } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

export default async function ShiftsPage() {
  const [shifts, users] = await Promise.all([getShifts(), getUsers()]);
  const nameById = new Map(users.map((u) => [u.id, u.name]));

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <p className="eyebrow">Operación</p>
        <h1 className="font-display text-3xl font-extrabold text-ink">Turnos</h1>
        <p className="mt-2 text-sm text-ink-soft">Abiertos y cerrados. Toca un turno para ver el comprobante o cerrarlo.</p>
      </div>

      {shifts.length === 0 ? (
        <div className="ticket p-6 text-center text-sm text-ink-soft">Todavía no hay turnos registrados.</div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift, i) => {
            const net = shift.gross_income - shift.daily_fee_snapshot;
            return (
              <Link
                key={shift.id}
                href={`/shift/${shift.id}`}
                className="reveal ticket flex items-center justify-between gap-4 overflow-hidden p-4 transition hover:shadow-[var(--shadow-raise)]"
                style={{ ['--i' as string]: i }}
              >
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">{shift.shift_date}</p>
                  <p className="mt-0.5 font-medium text-ink">{nameById.get(shift.conductor_id) ?? 'Conductor'}</p>
                  <span className={`badge mt-1 ${shift.status === 'CERRADO' ? 'badge-closed' : 'badge-open'}`}>{shift.status}</span>
                </div>
                <div className="text-right">
                  <p className="eyebrow">Base post-tarifa</p>
                  <p className="money text-lg text-ink">{formatCurrency(net)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
