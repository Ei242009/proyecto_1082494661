import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { getDailyConfig, getTodayShift } from '@/lib/dataService';
import ExpensePanel from '@/components/ExpensePanel';

export default async function ExpensesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;
  const config = await getDailyConfig();
  const shift = user?.role === 'conductor' ? await getTodayShift(user.userId) : null;

  if (!user || user.role !== 'conductor') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-900">Solo los conductores pueden registrar gastos aquí.</p>
          <p className="mt-3 text-sm text-stone-600">Ingresa con una cuenta de conductor para acceder al formulario.</p>
        </section>
      </main>
    );
  }

  if (!shift) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Gastos</p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">No hay turno activo</h1>
          <p className="mt-4 text-sm text-stone-600">Inicia tu turno primero en la sección Turno para poder registrar gastos del día.</p>
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
