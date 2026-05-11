import { getDailyConfig } from '@/lib/dataService';
import DailyConfigForm from '@/components/DailyConfigForm';

export default async function ConfigPage() {
  const config = await getDailyConfig();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">Configuración</p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900">Tarifa y límite de gasto</h1>
        <p className="mt-4 text-sm leading-6 text-stone-600">
          Ajusta la tarifa diaria y el límite de gasto. Los cambios aplican solo a nuevos turnos; los turnos ya abiertos conservarán la tarifa anterior.
        </p>
      </div>

      <DailyConfigForm initialDailyFee={config.daily_fee} initialExpenseLimit={config.expense_limit} />
    </main>
  );
}
