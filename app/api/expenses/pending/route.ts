import { NextResponse } from 'next/server';
import { getPendingExpensesCount } from '@/lib/dataService';

export async function GET() {
  const count = await getPendingExpensesCount();

  return NextResponse.json({ count }, { headers: { 'Cache-Control': 'no-store' } });
}
