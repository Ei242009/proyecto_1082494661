'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import PendingBadge from './PendingBadge';

type Role = 'admin' | 'conductor' | 'socio';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  role: Role[];
  badge?: boolean;
}

const I = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
    {d.split('|').map((p, i) => <path key={i} d={p} />)}
  </svg>
);

const navItems: NavItem[] = [
  { href: '/turno', label: 'Turno', icon: I('M12 7v5l3 2|M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z'), role: ['conductor'] },
  { href: '/gastos', label: 'Gastos', icon: I('M5 4h11l3 3v13H5z|M9 9h6|M9 13h6|M9 17h4'), role: ['conductor'] },
  { href: '/dashboard', label: 'Tablero', icon: I('M4 13h6v7H4z|M14 4h6v16h-6z|M4 4h6v5H4z'), role: ['admin'] },
  { href: '/reports', label: 'Reportes', icon: I('M4 19V5|M4 19h16|M8 16l3-4 3 2 4-6'), role: ['admin'] },
  { href: '/pendientes', label: 'Pendientes', icon: I('M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9|M10.5 21a1.8 1.8 0 0 0 3 0'), role: ['admin'], badge: true },
  { href: '/turnos', label: 'Turnos', icon: I('M4 6h16|M4 12h16|M4 18h16'), role: ['admin'] },
  { href: '/config', label: 'Config', icon: I('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.2A1.7 1.7 0 0 0 6.8 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H2a2 2 0 0 1 0-4h.2A1.7 1.7 0 0 0 4 5.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 3.6V3a2 2 0 0 1 4 0v.2A1.7 1.7 0 0 0 17.2 5l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z'), role: ['admin'] },
  { href: '/audit', label: 'Auditoría', icon: I('M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z|M21 21l-4.3-4.3'), role: ['socio'] },
  { href: '/profile', label: 'Perfil', icon: I('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z|M5 21a7 7 0 0 1 14 0'), role: ['admin', 'conductor', 'socio'] },
];

export default function BottomNav({ role, pendingCount }: { role: Role; pendingCount: number }) {
  const pathname = usePathname();
  const items = navItems.filter((item) => item.role.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line-strong bg-paper-2/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl justify-around gap-1 px-2 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 transition ${
                active ? 'text-marigold-deep' : 'text-ink-faint hover:text-ink-soft'
              }`}
            >
              <span
                className={`relative grid place-items-center rounded-xl px-3 py-1 transition ${
                  active ? 'bg-marigold-tint' : 'bg-transparent group-hover:bg-marigold-tint/50'
                }`}
              >
                {item.icon}
                {item.badge ? <PendingBadge count={pendingCount} /> : null}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
