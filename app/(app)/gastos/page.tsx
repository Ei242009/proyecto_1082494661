import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { getDailyConfig, getTodayShift } from '@/lib/dataService';
import ExpensePanel from '@/components/ExpensePanel';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;
  const config = await getDailyConfig();
  const shift = user?.role === 'conductor' ? await getTodayShift(user.userId) : null;

  if (!user || user.role !== 'conductor') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="reveal ticket p-6">
          <p className="eyebrow">Gastos</p>
          <h1 className="font-display mt-2 text-xl font-bold text-ink">Solo conductores</h1>
          <p className="mt-2 text-sm text-ink-soft">Ingresa con una cuenta de conductor para registrar gastos.</p>
        </section>
      </main>
    );
  }

  if (!shift) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="reveal ticket overflow-hidden">
          <div className="ticket-band" />
          <div className="p-6 text-center">
            <p className="font-mono text-4xl text-line-strong">⏱</p>
            <h1 className="font-display mt-3 text-2xl font-bold text-ink">No hay turno activo</h1>
            <p className="mt-2 text-sm text-ink-soft">Abre tu turno del día para empezar a registrar gastos.</p>
            <Link href="/turno" className="btn btn-primary mt-5 w-full">Ir a iniciar turno</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <ExpensePanel shiftId={shift.id} expenseLimit={config.expense_limit} />
    </main>
  );
}
