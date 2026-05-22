/**
 * app/api/emails/test/route.ts
 * POST /api/emails/test
 * Prueba sendPendingExpenseAlert
 * Solo disponible en modo 'seed'
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendPendingExpenseAlert } from '@/lib/emailService';
import type { ApiError } from '@/lib/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validar que estamos en modo seed
    if (process.env.MODE !== 'seed') {
      const error: ApiError = {
        error: 'Solo disponible en modo seed',
        code: 'NOT_SEED_MODE',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(error, { status: 403 });
    }

    // Parsear body
    const body = await request.json();
    const {
      ownerEmail = 'propietaria@busetas.co',
      conductorName = 'Juan Pérez',
      categoria = 'gasolina',
      monto = 150000,
      descripcion = 'Gasolina Premium en Ecopetrol',
    } = body;

    console.log('[api/emails/test] Enviando alerta de prueba a:', ownerEmail);

    const result = await sendPendingExpenseAlert({
      ownerEmail,
      conductorName,
      categoria,
      monto,
      descripcion,
    });

    if (!result.success) {
      const error: ApiError = {
        error: 'Error enviando email',
        code: 'EMAIL_ERROR',
        details: result.error,
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(error, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Email enviado exitosamente',
          messageId: result.messageId,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[api/emails/test] Error:', error);
    const apiError: ApiError = {
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
