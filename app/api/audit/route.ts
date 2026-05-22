import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getAuditShifts } from '@/lib/dataService';

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  try {
    const data = await getAuditShifts({ from, to });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching audit shifts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(withRole(['admin', 'socio'], handler));
