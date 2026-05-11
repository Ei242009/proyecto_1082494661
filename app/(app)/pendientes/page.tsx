export default function PendingPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Pendientes</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">Gastos por revisar</h1>
        <div className="mt-6 rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm text-stone-600">
          No hay gastos pendientes en este momento.
        </div>
      </div>
    </main>
  );
}
