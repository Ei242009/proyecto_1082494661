import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { getDailyConfig, getTodayShift } from '@/lib/dataService';
import { formatCurrency } from '@/lib/dateUtils';
import StartShiftForm from '@/components/StartShiftForm';

export default async function ShiftPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;
  const config = await getDailyConfig();
  const shift = user ? await getTodayShift(user.userId) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {user?.role !== 'conductor' ? (
        <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-900">Solo conductores pueden iniciar turno aquí.</p>
          <p className="mt-3 text-sm text-stone-600">Accede con una cuenta de conductor para crear el turno del día.</p>
        </section>
      ) : shift ? (
        <section className="space-y-4 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Turno activo</p>
              <h1 className="mt-2 text-2xl font-semibold text-stone-900">Turno de hoy</h1>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{shift.status}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-amber-50 p-4">
              <p className="text-sm text-stone-500">Ingreso bruto</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{formatCurrency(shift.gross_income)}</p>
            </div>
            <div className="rounded-3xl bg-stone-50 p-4">
              <p className="text-sm text-stone-500">Tarifa snapshot</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{formatCurrency(shift.daily_fee_snapshot)}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-sm text-stone-500">Base post-tarifa</p>
            <p className="mt-2 text-lg font-semibold text-stone-900">
              {formatCurrency(shift.gross_income - shift.daily_fee_snapshot)}
            </p>
          </div>
        </section>
      ) : (
        <StartShiftForm dailyFee={config.daily_fee} />
      )}
    </main>
  );
}
