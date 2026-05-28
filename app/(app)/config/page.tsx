import { getDailyConfig } from '@/lib/dataService';
import DailyConfigForm from '@/components/DailyConfigForm';

export const dynamic = 'force-dynamic';

export default async function ConfigPage() {
  const config = await getDailyConfig();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <p className="eyebrow">Configuración</p>
        <h1 className="font-display text-3xl font-extrabold text-ink">Tarifa y límite</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Define la tarifa diaria y el límite de gasto que se aprueba automáticamente.
        </p>
      </div>

      <DailyConfigForm initialDailyFee={config.daily_fee} initialExpenseLimit={config.expense_limit} />
    </main>
  );
}
