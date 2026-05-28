'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { itemsForRole, type Role } from './navConfig';
import PendingBadge from './PendingBadge';

export default function BottomNav({ role, pendingCount }: { role: Role; pendingCount: number }) {
  const pathname = usePathname();
  const items = itemsForRole(role).filter((i) => i.primary);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-line-strong bg-paper-2/95 backdrop-blur-xl lg:hidden">
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
              <span className={`relative grid place-items-center rounded-xl px-3 py-1 transition ${active ? 'bg-marigold-tint' : 'group-hover:bg-marigold-tint/50'}`}>
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
