import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { getAuditShifts } from '@/lib/dataService';
import { formatCurrency } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  await verifyUserJwt(token ?? '').catch(() => null);

  const auditItems = await getAuditShifts();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-5">
        <p className="eyebrow">Auditoría · solo lectura</p>
        <h1 className="font-display text-3xl font-extrabold text-ink">Turnos cerrados</h1>
        <p className="mt-2 text-sm text-ink-soft">Verifica que la tarifa diaria se descontó en cada turno.</p>
      </div>

      {auditItems.length === 0 ? (
        <div className="ticket p-6 text-center text-sm text-ink-soft">Aún no hay turnos cerrados para auditar.</div>
      ) : (
        <div className="space-y-3">
          {auditItems.map((item, i) => (
            <article key={i} className="reveal ticket overflow-hidden" style={{ ['--i' as string]: i }}>
              <div className="flex items-center justify-between px-5 pt-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">{item.date}</p>
                  <p className="mt-0.5 font-medium text-ink">{item.conductor_name}</p>
                </div>
                <span className={`badge ${item.status === 'CERRADO' ? 'badge-closed' : 'badge-open'}`}>{item.status}</span>
              </div>
              <div className="tear mt-4" />
              <div className="grid grid-cols-2 divide-x divide-line px-2 py-3 text-center">
                <div>
                  <p className="eyebrow">Ingreso bruto</p>
                  <p className="money mt-1 text-base text-ink">{formatCurrency(item.gross_income)}</p>
                </div>
                <div>
                  <p className="eyebrow">Tarifa descontada</p>
                  <p className="money mt-1 text-base text-ink-soft">−{formatCurrency(item.daily_fee_snapshot)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
