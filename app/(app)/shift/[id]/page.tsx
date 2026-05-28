import { cookies } from 'next/headers';
import { getShiftById, getExpensesByShiftId } from '@/lib/dataService';
import { verifyUserJwt } from '@/lib/auth';
import { buildReceipt } from '@/lib/liquidationService';
import LiquidationReceipt from '@/components/shift/LiquidationReceipt';
import CloseShiftPanel from '@/components/shift/CloseShiftPanel';
import { formatCurrency } from '@/lib/dateUtils';

export const dynamic = 'force-dynamic';

interface Params {
  params: Promise<{ id: string }>;
}

function Guard({ title, text }: { title: string; text: string }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <section className="reveal ticket p-6">
        <p className="eyebrow">Aviso</p>
        <h1 className="font-display mt-2 text-xl font-bold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">{text}</p>
      </section>
    </main>
  );
}

export default async function ShiftDetailPage({ params }: Params) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;
  const shift = user ? await getShiftById(id) : null;

  if (!user) return <Guard title="Acceso restringido" text="Inicia sesión para ver el comprobante o cerrar el turno." />;
  if (!shift) return <Guard title="Turno no encontrado" text="Verifica que el identificador del turno sea correcto." />;
  if (user.role === 'conductor' && shift.conductor_id !== user.userId)
    return <Guard title="No autorizado" text="No tienes permiso para ver este turno." />;
  if (user.role === 'socio')
    return <Guard title="Acceso restringido" text="Los socios solo consultan la auditoría de turnos cerrados." />;

  if (shift.status === 'CERRADO') {
    const receipt = await buildReceipt(shift.id);
    return (
      <main className="mx-auto px-4 py-6 sm:px-6">
        <LiquidationReceipt receipt={receipt} />
      </main>
    );
  }

  const expenses = await getExpensesByShiftId(shift.id);
  const totalApproved = expenses.filter((e) => e.status === 'APROBADO').reduce((s, e) => s + e.amount, 0);
  const basePostFee = shift.gross_income - shift.daily_fee_snapshot;
  const partialNet = basePostFee - totalApproved;

  return (
    <main className="mx-auto max-w-3xl space-y-5 px-4 py-6 sm:px-6">
      <section className="reveal ticket overflow-hidden" style={{ ['--i' as string]: 0 }}>
        <div className="ticket-band" />
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Turno abierto</p>
            <span className="badge badge-open">{shift.status}</span>
          </div>
          <p className="eyebrow mt-4">Utilidad neta parcial</p>
          <p className={`money text-4xl ${partialNet < 0 ? 'money-neg' : 'money-pos'}`}>{formatCurrency(partialNet)}</p>
        </div>
        <div className="tear mt-5" />
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
          {[
            ['Ingreso', formatCurrency(shift.gross_income)],
            ['Tarifa', `−${formatCurrency(shift.daily_fee_snapshot)}`],
            ['Base', formatCurrency(basePostFee)],
            ['Gastos', `−${formatCurrency(totalApproved)}`],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#FFFDF8] px-3 py-3 text-center">
              <p className="eyebrow">{k}</p>
              <p className="money mt-1 text-sm text-ink">{v}</p>
            </div>
          ))}
        </div>
      </section>

      {user.role === 'admin' ? (
        <CloseShiftPanel shiftId={shift.id} />
      ) : (
        <div className="reveal rounded-2xl border border-warn/30 bg-warn-tint px-4 py-3 text-sm text-warn" style={{ ['--i' as string]: 1 }}>
          El turno sigue abierto. La propietaria lo cerrará y generará el comprobante.
        </div>
      )}
    </main>
  );
}
