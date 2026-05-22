import { getSystemMode } from '@/lib/dataService';

export default async function DashboardPage() {
  const mode = getSystemMode();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-amber-700">Dashboard</p>
            <h1 className="mt-2 text-2xl font-semibold text-stone-900">Resumen de la propietaria</h1>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
            Modo {mode}
          </span>
        </div>
      </div>

      <section className="grid gap-4">
        <article className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Ingresos del día</p>
          <p className="mt-3 text-3xl font-semibold text-stone-900">$0</p>
          <p className="mt-2 text-sm text-stone-500">Aún no hay datos reales, pero el diseño permite lectura clara en 375px.</p>
        </article>

        <article className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Gastos pendientes</p>
          <p className="mt-3 text-3xl font-semibold text-stone-900">0</p>
          <p className="mt-2 text-sm text-stone-500">El badge en la barra inferior se actualiza con el conteo real.</p>
        </article>
      </section>
    </main>
  );
}
