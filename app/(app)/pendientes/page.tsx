import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import PendingExpensesClient from '@/components/PendingExpensesClient';

export const dynamic = 'force-dynamic';

export default async function PendingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;

  if (!user || user.role !== 'admin') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="reveal ticket p-6">
          <p className="eyebrow">Acceso restringido</p>
          <h1 className="font-display mt-2 text-xl font-bold text-ink">Solo la propietaria</h1>
          <p className="mt-2 text-sm text-ink-soft">Solo la propietaria puede revisar y decidir sobre los gastos pendientes.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-5xl">
      <div className="mb-5">
        <p className="eyebrow">Aprobaciones</p>
        <h1 className="font-display text-3xl font-extrabold text-ink">Gastos por revisar</h1>
      </div>
      <PendingExpensesClient />
    </main>
  );
}
