import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { updateUserStatus, recordAudit } from '@/lib/dataService';
import type { JwtUser } from '@/lib/types';

type RouteContext = { params: Promise<{ id: string }> };

async function patchHandler(request: NextRequest, context: unknown, admin: JwtUser) {
  try {
    const { id } = await (context as RouteContext).params;
    const { is_active }: { is_active: boolean } = await request.json();
    const user = await updateUserStatus(id, is_active);
    await recordAudit({
      user_id: admin.userId,
      user_email: admin.email,
      user_role: admin.role,
      action: 'toggle_user',
      entity: 'user',
      entity_id: id,
      summary: `Usuario ${user.email} ${is_active ? 'activado' : 'suspendido'}`,
    });
    return NextResponse.json(user, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 400 });
  }
}

export const PATCH = withAuth(withRole(['admin'], patchHandler));
