import { NextResponse } from 'next/server';
import { getSystemMode } from '@/lib/dataService';

export async function GET() {
  const mode = getSystemMode();

  return NextResponse.json(mode, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
