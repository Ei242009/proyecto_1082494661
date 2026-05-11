export default function ExpensesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Gastos</p>
            <h1 className="mt-2 text-2xl font-semibold text-stone-900">Registro inmediato</h1>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-3xl bg-amber-50 p-4 text-sm font-semibold text-stone-900">
            Selecciona la categoría y registra el monto rápidamente.
          </div>
          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            Aún no hay gastos registrados.
          </div>
          <button className="mt-4 min-h-[48px] w-full rounded-3xl bg-amber-600 px-4 text-base font-semibold text-white shadow-sm transition hover:bg-amber-700">
            Nuevo gasto
          </button>
        </div>
      </section>
    </main>
  );
}
