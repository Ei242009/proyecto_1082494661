import { NextResponse, type NextRequest } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { runMigrations } from '@/lib/pgMigrate';
import { recordAudit } from '@/lib/dataService';
import type { JwtUser } from '@/lib/types';

async function handler(_request: NextRequest, _ctx: unknown, user: JwtUser) {
  try {
    const result = await runMigrations();
    await recordAudit({
      user_id: user.userId,
      user_email: user.email,
      user_role: user.role,
      action: 'bootstrap',
      entity: 'system',
      summary: `Bootstrap ejecutado (${result.log.length} pasos)`,
      metadata: { log: result.log },
    });
    return NextResponse.json(
      { success: true, log: result.log },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error ejecutando el bootstrap';
    return NextResponse.json({ error: message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

// Solo la propietaria (admin) puede ejecutar migraciones + seed.
export const POST = withAuth(withRole(['admin'], handler));
