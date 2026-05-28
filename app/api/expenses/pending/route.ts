import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getPendingExpenses, getPendingExpensesCount } from '@/lib/dataService';

async function handler(request: NextRequest) {
  const list = new URL(request.url).searchParams.get('list') === 'true';

  if (list) {
    const expenses = await getPendingExpenses();
    return NextResponse.json({ expenses }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const count = await getPendingExpensesCount();
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}

// Solo la propietaria (admin) ve los gastos pendientes de todos los conductores.
export const GET = withAuth(withRole(['admin'], handler));
