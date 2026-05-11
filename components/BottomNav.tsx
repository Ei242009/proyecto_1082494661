'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PendingBadge from './PendingBadge';

type Role = 'admin' | 'conductor' | 'socio';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  role: Role[];
  badge?: boolean;
}

const navItems: NavItem[] = [
  { href: '/turno', label: 'Turno', icon: '⏱️', role: ['conductor'] },
  { href: '/gastos', label: 'Gastos', icon: '🧾', role: ['conductor'] },
  { href: '/dashboard', label: 'Dashboard', icon: '📊', role: ['admin'] },
  { href: '/pendientes', label: 'Pendientes', icon: '🔔', role: ['admin'], badge: true },
  { href: '/turnos', label: 'Turnos', icon: '📋', role: ['admin'] },
  { href: '/config', label: 'Config', icon: '⚙️', role: ['admin'] },
  { href: '/audit', label: 'Auditoría', icon: '🔎', role: ['socio'] },
  { href: '/profile', label: 'Perfil', icon: '👤', role: ['admin', 'conductor', 'socio'] },
];

export default function BottomNav({ role, pendingCount }: { role: Role; pendingCount: number }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.role.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl justify-around px-2 py-2">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative inline-flex min-h-[48px] min-w-[64px] flex-1 flex-col items-center justify-center rounded-3xl px-1 text-center transition ${
                active ? 'text-amber-700' : 'text-stone-500 hover:text-amber-600'
              }`}
            >
              <span className="mb-1 text-xl">{item.icon}</span>
              <span className="text-[11px] font-semibold leading-none">{item.label}</span>
              {item.badge ? <PendingBadge count={pendingCount} /> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
