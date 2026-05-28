import Link from 'next/link';
import { getDashboardData } from '@/lib/dataService';
import { formatCurrency } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

function Kpi({ label, value, tone = 'ink', i }: { label: string; value: string; tone?: 'ink' | 'pos' | 'neg' | 'warn'; i: number }) {
  const toneClass = tone === 'pos' ? 'text-pos' : tone === 'neg' ? 'text-neg' : tone === 'warn' ? 'text-warn' : 'text-ink';
  return (
    <article className="reveal ticket p-4" style={{ ['--i' as string]: i }}>
      <p className="eyebrow">{label}</p>
      <p className={`money mt-2 text-2xl ${toneClass}`}>{value}</p>
    </article>
  );
}

export default async function DashboardPage() {
  const [day, week, month] = await Promise.all([
    getDashboardData('day'),
    getDashboardData('week'),
    getDashboardData('month'),
  ]);

  const quickLinks = [
    { href: '/reports', label: 'Reportes' },
    { href: '/admin/users', label: 'Usuarios' },
    { href: '/admin/audit-log', label: 'Bitácora' },
    { href: '/admin/db-setup', label: 'DB Setup' },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-5xl">
      {/* Hero: recaudo del día */}
      <section className="reveal ticket overflow-hidden" style={{ ['--i' as string]: 0 }}>
        <div className="ticket-band" />
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Recaudo de hoy</p>
            {day.pendingExpensesCount > 0 ? (
              <span className="badge badge-warn">{day.pendingExpensesCount} pendiente{day.pendingExpensesCount > 1 ? 's' : ''}</span>
            ) : (
              <span className="badge badge-pos">Al día</span>
            )}
          </div>
          <p className="money mt-2 text-5xl text-ink">{formatCurrency(day.totalGrossIncome)}</p>
          <p className="mt-2 text-sm text-ink-soft">
            {day.closedShiftsCount} turno{day.closedShiftsCount === 1 ? '' : 's'} cerrado{day.closedShiftsCount === 1 ? '' : 's'} hoy.
          </p>
        </div>
        <div className="tear mt-5" />
        <div className="grid grid-cols-3 divide-x divide-line px-2 py-4 text-center">
          <div>
            <p className="eyebrow">Tarifa</p>
            <p className="money mt-1 text-base text-ink-soft">{formatCurrency(day.totalDailyFee)}</p>
          </div>
          <div>
            <p className="eyebrow">Gastos</p>
            <p className="money mt-1 text-base text-ink-soft">{formatCurrency(day.totalApprovedExpenses)}</p>
          </div>
          <div>
            <p className="eyebrow">Utilidad</p>
            <p className={`money mt-1 text-base ${day.netIncome < 0 ? 'money-neg' : 'money-pos'}`}>
              {formatCurrency(day.netIncome)}
            </p>
          </div>
        </div>
      </section>

      {/* Acumulados */}
      <div className="mt-5 flex items-center gap-2">
        <span className="h-px flex-1 bg-line-strong" />
        <p className="eyebrow">Acumulado</p>
        <span className="h-px flex-1 bg-line-strong" />
      </div>

      <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi i={1} label="Utilidad · semana" value={formatCurrency(week.netIncome)} tone={week.netIncome < 0 ? 'neg' : 'pos'} />
        <Kpi i={2} label="Utilidad · mes" value={formatCurrency(month.netIncome)} tone={month.netIncome < 0 ? 'neg' : 'pos'} />
        <Kpi i={3} label="Recaudo · mes" value={formatCurrency(month.totalGrossIncome)} />
        <Kpi i={4} label="Turnos · mes" value={String(month.closedShiftsCount)} />
      </section>

      {/* Accesos rápidos (móvil): en desktop estos viven en el sidebar */}
      <section className="mt-6 lg:hidden">
        <p className="eyebrow mb-3">Más</p>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map((q, i) => (
            <Link key={q.href} href={q.href} className="reveal ticket px-4 py-3 text-sm font-semibold text-ink transition active:scale-[.99]" style={{ ['--i' as string]: 5 + i }}>
              {q.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
