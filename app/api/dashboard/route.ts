import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getDashboardData } from '@/lib/dataService';

async function handler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') as 'day' | 'week' | 'month';

  if (!period || !['day', 'week', 'month'].includes(period)) {
    return NextResponse.json({ error: 'Invalid period. Must be day, week, or month.' }, { status: 400 });
  }

  try {
    const data = await getDashboardData(period);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(withRole(['admin'], handler));