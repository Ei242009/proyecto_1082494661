export default function ShiftsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-500">Turnos</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">Lista de turnos</h1>
        <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          Aquí aparecerán los turnos abiertos y cerrados para controlar la ruta.
        </div>
      </div>
    </main>
  );
}
