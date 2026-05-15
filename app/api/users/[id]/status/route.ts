import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';
import { updateUserStatus } from '@/lib/dataService';

interface Params {
  id: string;
}

async function patchHandler(request: NextRequest, { params }: { params: Params }) {
  try {
    const { is_active }: { is_active: boolean } = await request.json();
    const user = await updateUserStatus(params.id, is_active);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 400 });
  }
}

export const PATCH = withAuth(withRole(['admin'], patchHandler));