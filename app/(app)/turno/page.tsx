import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { getDailyConfig, getTodayShift, getExpensesByShiftId } from '@/lib/dataService';
import { formatCurrency } from '@/lib/dateUtils';
import StartShiftForm from '@/components/StartShiftForm';

export const dynamic = 'force-dynamic';

export default async function ShiftPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;
  const config = await getDailyConfig();
  const shift = user?.role === 'conductor' ? await getTodayShift(user.userId) : null;
  const expenses = shift ? await getExpensesByShiftId(shift.id) : [];

  const approved = expenses.filter((e) => e.status === 'APROBADO').reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter((e) => e.status === 'PENDIENTE');
  const basePostFee = shift ? shift.gross_income - shift.daily_fee_snapshot : 0;
  const partialNet = basePostFee - approved;

  if (user && user.role !== 'conductor') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="reveal ticket p-6">
          <p className="eyebrow">Turno</p>
          <h1 className="font-display mt-2 text-xl font-bold text-ink">Solo el conductor inicia turno</h1>
          <p className="mt-2 text-sm text-ink-soft">Ingresa con una cuenta de conductor para abrir el turno del día.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {shift ? (
        <div className="space-y-5">
          {/* Tiquete del turno activo */}
          <section className="reveal ticket overflow-hidden" style={{ ['--i' as string]: 0 }}>
            <div className="ticket-band" />
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <p className="eyebrow">Turno de hoy</p>
                <p className="font-mono mt-1 text-sm text-ink-faint">
                  {new Date(shift.shift_date + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <span className={`badge ${shift.status === 'ABIERTO' ? 'badge-open' : 'badge-closed'}`}>{shift.status}</span>
            </div>

            <div className="px-6 pt-5">
              <p className="eyebrow">Utilidad neta parcial</p>
              <p className={`money text-4xl ${partialNet < 0 ? 'money-neg' : 'money-pos'}`}>{formatCurrency(partialNet)}</p>
            </div>

            <div className="tear mt-5" />
            <div className="grid grid-cols-3 divide-x divide-line px-2 py-4 text-center">
              <div>
                <p className="eyebrow">Ingreso</p>
                <p className="money mt-1 text-sm text-ink">{formatCurrency(shift.gross_income)}</p>
              </div>
              <div>
                <p className="eyebrow">Tarifa</p>
                <p className="money mt-1 text-sm text-ink-soft">−{formatCurrency(shift.daily_fee_snapshot)}</p>
              </div>
              <div>
                <p className="eyebrow">Gastos</p>
                <p className="money mt-1 text-sm text-ink-soft">−{formatCurrency(approved)}</p>
              </div>
            </div>
          </section>

          {pending.length > 0 ? (
            <div className="reveal rounded-2xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn" style={{ ['--i' as string]: 1 }}>
              <span className="font-bold">{pending.length} gasto{pending.length > 1 ? 's' : ''} en revisión</span> · no cuenta{pending.length > 1 ? 'n' : ''} en la utilidad hasta que la propietaria los apruebe.
            </div>
          ) : null}

          <Link href="/gastos" className="reveal btn btn-primary w-full" style={{ ['--i' as string]: 2 }}>
            Registrar un gasto
          </Link>
        </div>
      ) : (
        <StartShiftForm dailyFee={config.daily_fee} userName={user?.email?.split('@')[0]} />
      )}
    </main>
  );
}
