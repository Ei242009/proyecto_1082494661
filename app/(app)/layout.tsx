import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyUserJwt } from '@/lib/auth';
import { getPendingExpensesCount } from '@/lib/dataService';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';

const ROLE_LABEL: Record<string, string> = {
  admin: 'Propietaria',
  conductor: 'Conductor',
  socio: 'Socio',
};

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
      if (user.mustChangePassword) redirect('/profile');
    } catch {
      role = null;
    }
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar fijo (desktop) */}
      {role ? <Sidebar role={role} pendingCount={pendingCount} /> : null}

      {/* Tablero de ruta — letrero de destino del bus (solo móvil/tablet) */}
      <header className="board sticky top-0 z-40 lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-marigold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.4)]">
              <svg viewBox="0 0 48 32" className="h-6 w-6" fill="none" aria-hidden>
                <rect x="3" y="6" width="42" height="17" rx="4" fill="currentColor" />
                <rect x="7" y="10" width="11" height="6" rx="1.5" fill="#FCF6EA" />
                <rect x="20" y="10" width="11" height="6" rx="1.5" fill="#FCF6EA" />
                <circle cx="14" cy="26" r="3.2" fill="currentColor" />
                <circle cx="34" cy="26" r="3.2" fill="currentColor" />
                <path d="M36 10h6v6h-6z" fill="#FCF6EA" />
              </svg>
            </span>
            <div className="leading-none">
              <p className="board-led text-[10px]">BUSETA · APP</p>
              <p className="font-display text-xl font-extrabold text-paper-2">Tiquete de Ruta</p>
            </div>
          </div>
          {role ? (
            <span className="rounded-full border border-marigold/40 bg-black/20 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-marigold">
              {ROLE_LABEL[role]}
            </span>
          ) : null}
        </div>
      </header>

      <div className="min-h-[calc(100vh-72px)] pb-28 lg:pb-10 lg:pl-64">{children}</div>
      {role ? <BottomNav role={role} pendingCount={pendingCount} /> : null}
    </div>
  );
}
