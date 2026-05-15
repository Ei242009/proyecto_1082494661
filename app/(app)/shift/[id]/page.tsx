import { cookies } from 'next/headers';
import { getShiftById, getExpensesByShiftId } from '@/lib/dataService';
import { verifyUserJwt } from '@/lib/auth';
import { buildReceipt } from '@/lib/liquidationService';
import LiquidationReceipt from '@/components/shift/LiquidationReceipt';
import CloseShiftPanel from '@/components/shift/CloseShiftPanel';
import { formatCurrency } from '@/lib/dateUtils';

interface Params {
  params: { id: string };
}

export default async function ShiftDetailPage({ params }: Params) {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  const user = token ? await verifyUserJwt(token).catch(() => null) : null;
  const shift = user ? await getShiftById(params.id) : null;

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-900">Acceso restringido</p>
          <p className="mt-3 text-sm text-stone-600">Inicia sesión para ver el comprobante o cerrar el turno.</p>
        </section>
      </main>
    );
  }

  if (!shift) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-900">Turno no encontrado</p>
          <p className="mt-3 text-sm text-stone-600">Verifica que el identificador del turno sea correcto.</p>
        </section>
      </main>
    );
  }

  if (user.role === 'conductor' && shift.conductor_id !== user.userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-900">No autorizado</p>
          <p className="mt-3 text-sm text-stone-600">No tienes permiso para ver este turno.</p>
        </section>
      </main>
    );
  }

  if (user.role === 'socio') {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <section className="rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-stone-900">Acceso restringido</p>
          <p className="mt-3 text-sm text-stone-600">Los socios no pueden acceder a detalles de cierre de turnos.</p>
        </section>
      </main>
    );
  }

  if (shift.status === 'CERRADO') {
    const receipt = await buildReceipt(shift.id);
    return (
      <main className="mx-auto px-4 py-6 sm:px-6">
        <LiquidationReceipt receipt={receipt} />
      </main>
    );
  }

  const expenses = await getExpensesByShiftId(shift.id);
  const approvedExpenses = expenses.filter((expense) => expense.status === 'APROBADO');
  const totalApproved = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const basePostFee = shift.gross_income - shift.daily_fee_snapshot;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <section className="space-y-6 rounded-[20px] border border-stone-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-amber-700">Turno abierto</p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900">Cierre de turno</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Ingreso Bruto</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{formatCurrency(shift.gross_income)}</p>
          </div>
          <div className="rounded-3xl bg-stone-50 p-4">
            <p className="text-sm text-stone-500">Tarifa snapshot</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{formatCurrency(shift.daily_fee_snapshot)}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-amber-50 p-4">
          <p className="text-sm text-stone-500">Base Post-Tarifa</p>
          <p className="mt-2 text-lg font-semibold text-stone-900">{formatCurrency(basePostFee)}</p>
        </div>

        <div className="rounded-3xl bg-stone-50 p-4">
          <p className="text-sm text-stone-500">Gastos aprobados</p>
          <p className="mt-2 text-lg font-semibold text-stone-900">{formatCurrency(totalApproved)}</p>
        </div>

        {user.role === 'admin' ? <CloseShiftPanel shiftId={shift.id} /> : (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            El turno sigue abierto. La propietaria podrá cerrarlo desde este mismo comprobante.
          </div>
        )}
      </section>
    </main>
  );
}
