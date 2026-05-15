import { NextResponse } from 'next/server';
import { getPendingExpenses, getPendingExpensesCount } from '@/lib/dataService';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const list = url.searchParams.get('list') === 'true';

  if (list) {
    const expenses = await getPendingExpenses();
    return NextResponse.json({ expenses }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const count = await getPendingExpensesCount();
  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}
