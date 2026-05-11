import { NextResponse } from 'next/server';

const auditData = [
  { date: '2026-05-11', conductor: 'Wilfrido', gross: 320000, daily_fee: 80000, status: 'CERRADO' },
  { date: '2026-05-10', conductor: 'Wilfrido', gross: 280000, daily_fee: 80000, status: 'CERRADO' },
];

export async function GET() {
  return NextResponse.json({ data: auditData }, { headers: { 'Cache-Control': 'no-store' } });
}
