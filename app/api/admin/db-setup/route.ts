import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const secret = body.secret || process.env.ADMIN_BOOTSTRAP_SECRET;

  if (!secret || secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
    return NextResponse.json(
      { error: 'Invalid bootstrap secret' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    {
      success: true,
      message: 'Las 4 migrations y la configuración inicial se ejecutarían aquí. Cambia el modo a live configurando NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
