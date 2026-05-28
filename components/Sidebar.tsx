'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { itemsForRole, type Role } from './navConfig';
import PendingBadge from './PendingBadge';

const ROLE_LABEL: Record<Role, string> = { admin: 'Propietaria', conductor: 'Conductor', socio: 'Socio' };

export default function Sidebar({ role, pendingCount }: { role: Role; pendingCount: number }) {
  const pathname = usePathname();
  const items = itemsForRole(role);

  return (
    <aside className="board hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
      {/* Marca / letrero de destino */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-marigold text-ink shadow-[inset_0_1px_0_rgba(255,255,255,.4)]">
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
          <p className="board-led text-[9px]">BUSETA · APP</p>
          <p className="font-display text-lg font-extrabold text-paper-2">Tiquete</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-marigold text-ink'
                  : 'text-paper-2/70 hover:bg-white/10 hover:text-paper-2'
              }`}
            >
              <span className="relative">
                {item.icon}
                {item.badge ? <PendingBadge count={pendingCount} /> : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-marigold">{ROLE_LABEL[role]}</p>
        <p className="mt-0.5 font-mono text-[10px] text-paper-2/50">COP · Bogotá</p>
      </div>
    </aside>
  );
}
