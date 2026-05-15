import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { getUsers, createUser } from '@/lib/dataService';
import { CreateUserRequest } from '@/lib/types';

async function getHandler() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function postHandler(request: NextRequest) {
  try {
    const body: CreateUserRequest = await request.json();
    const result = await createUser(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 400 });
  }
}

export const GET = withAuth(withRole(['admin'], getHandler));
export const POST = withAuth(withRole(['admin'], postHandler));