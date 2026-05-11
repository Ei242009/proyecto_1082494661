import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { verifyUserJwt } from '@/lib/auth';
import { getPendingExpensesCount } from '@/lib/dataService';
import BottomNav from '@/components/BottomNav';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  let role: 'admin' | 'conductor' | 'socio' | null = null;
  let pendingCount = 0;

  if (token) {
    try {
      const user = await verifyUserJwt(token);
      role = user.role;
      pendingCount = await getPendingExpensesCount();
    } catch {
      role = null;
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 text-stone-900">
      <div className="min-h-[calc(100vh-72px)] pb-24">{children}</div>
      {role ? <BottomNav role={role} pendingCount={pendingCount} /> : null}
    </div>
  );
}
