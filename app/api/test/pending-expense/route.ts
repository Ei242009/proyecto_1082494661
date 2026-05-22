import { NextResponse } from 'next/server';
import { sendPendingExpenseAlert } from '@/lib/emailService';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email') || process.env.RESEND_FROM_EMAIL;
  if (!email) {
    return NextResponse.json(
      { error: 'Missing email query parameter or RESEND_FROM_EMAIL' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const result = await sendPendingExpenseAlert(email, {
      conductor: 'Wilfrido (Conductor)',
      category: 'Combustible',
      amount: 250000,
      description: 'Prueba de alerta de gasto pendiente.',
    });

    return NextResponse.json(
      { success: true, result },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error sending email';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
