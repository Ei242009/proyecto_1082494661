import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getUsers, createUser, recordAudit } from '@/lib/dataService';
import { CreateUserRequest, JwtUser } from '@/lib/types';

async function getHandler() {
  try {
    const users = await getUsers();
    return NextResponse.json(users, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(request: NextRequest, _ctx: unknown, admin: JwtUser) {
  try {
    const body: CreateUserRequest = await request.json();
    const result = await createUser(body);
    await recordAudit({
      user_id: admin.userId,
      user_email: admin.email,
      user_role: admin.role,
      action: 'create_user',
      entity: 'user',
      summary: `Usuario creado: ${body.email} (${body.role})`,
    });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 400 });
  }
}

export const GET = withAuth(withRole(['admin'], getHandler));
export const POST = withAuth(withRole(['admin'], postHandler));
