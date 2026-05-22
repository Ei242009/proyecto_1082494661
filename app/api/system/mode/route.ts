/**
 * app/api/system/mode/route.ts
 * GET /api/system/mode
 * Retorna el modo actual: 'seed' o 'production'
 */

import { NextResponse } from 'next/server';
import type { SystemMode } from '@/lib/types';

export async function GET(): Promise<NextResponse> {
  const mode = process.env.MODE || 'production';

  const response: SystemMode = {
    mode: (mode === 'seed' ? 'seed' : 'production') as 'seed' | 'production',
  };

  return NextResponse.json(response, { status: 200 });
}
