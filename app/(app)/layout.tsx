import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserJwt } from '@/lib/auth';
import { getPendingExpensesCount } from '@/lib/dataService';
import BottomNav from '@/components/BottomNav';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('buseta_session')?.value;
  let role: 'admin' | 'conductor' | 'socio' | null = null;
  let pendingCount = 0;
  let mustChangePassword = false;

  if (token) {
    try {
      const user = await verifyUserJwt(token);
      role = user.role;
      mustChangePassword = user.mustChangePassword || false;
      pendingCount = await getPendingExpensesCount();

      // Redirect to profile if password change is required
      if (mustChangePassword) {
        redirect('/profile');
      }
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
