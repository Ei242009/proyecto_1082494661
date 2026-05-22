/**
 * app/api/config/daily-config/route.ts
 * GET /api/config/daily-config
 * Retorna la configuración diaria (tarifa, límite de gasto)
 */

import { NextResponse } from 'next/server';
import { getDailyConfig } from '@/lib/seedReader';
import type { ApiSuccess, DailyConfig } from '@/lib/types';

export async function GET(): Promise<NextResponse> {
  try {
    const config = getDailyConfig();

    const response: ApiSuccess<DailyConfig> = {
      success: true,
      data: config,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[api/config/daily-config] Error:', error);
    return NextResponse.json(
      {
        error: 'Error obteniendo configuración',
        code: 'CONFIG_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
