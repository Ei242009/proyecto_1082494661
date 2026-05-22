import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import PendingExpensesClient from '@/components/PendingExpensesClient';

export default async function PendingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;

  if (!user || user.role !== 'admin') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-900">Acceso restringido</p>
          <p className="mt-3 text-sm text-stone-600">Solo la propietaria puede revisar y decidir sobre los gastos pendientes.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Pendientes</p>
            <h1 className="mt-3 text-2xl font-semibold text-stone-900">Gastos por revisar</h1>
          </div>
        </div>
        <div className="mt-6">
          <PendingExpensesClient />
        </div>
      </section>
    </main>
  );
}
