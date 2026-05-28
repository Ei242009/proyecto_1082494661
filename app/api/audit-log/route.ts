import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { readAuditMonth } from '@/lib/dataService';

function bogotaYyyymm(): string {
  const d = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Bogota' }).format(new Date());
  return d.slice(0, 7).replace('-', '');
}

async function handler(request: NextRequest) {
  const raw = new URL(request.url).searchParams.get('month');
  // Acepta "YYYY-MM" (input month) o "YYYYMM".
  const yyyymm = raw ? raw.replace('-', '').slice(0, 6) : bogotaYyyymm();

  if (!/^\d{6}$/.test(yyyymm)) {
    return NextResponse.json({ error: 'Mes inválido (use YYYY-MM)' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  }

  try {
    const entries = await readAuditMonth(yyyymm);
    return NextResponse.json({ yyyymm, entries }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error reading audit log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

// Bitácora técnica: solo la propietaria (admin).
export const GET = withAuth(withRole(['admin'], handler));
