import type { ReactNode } from 'react';

export type Role = 'admin' | 'conductor' | 'socio';

export interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  roles: Role[];
  /** Aparece en el bottom nav móvil (máx ~5 por rol). Si false, solo en el sidebar desktop. */
  primary?: boolean;
  badge?: boolean;
}

const I = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="h-[22px] w-[22px]">
    {d.split('|').map((p, i) => <path key={i} d={p} />)}
  </svg>
);

export const NAV_ITEMS: NavItem[] = [
  // Conductor
  { href: '/turno', label: 'Turno', icon: I('M12 7v5l3 2|M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z'), roles: ['conductor'], primary: true },
  { href: '/gastos', label: 'Gastos', icon: I('M5 4h11l3 3v13H5z|M9 9h6|M9 13h6|M9 17h4'), roles: ['conductor'], primary: true },
  // Admin
  { href: '/dashboard', label: 'Tablero', icon: I('M4 13h6v7H4z|M14 4h6v16h-6z|M4 4h6v5H4z'), roles: ['admin'], primary: true },
  { href: '/pendientes', label: 'Pendientes', icon: I('M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9|M10.5 21a1.8 1.8 0 0 0 3 0'), roles: ['admin'], primary: true, badge: true },
  { href: '/turnos', label: 'Turnos', icon: I('M4 6h16|M4 12h16|M4 18h16'), roles: ['admin'], primary: true },
  { href: '/config', label: 'Config', icon: I('M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z|M19.4 13a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 0 1-4 0v-.2A1.7 1.7 0 0 0 6.8 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H2a2 2 0 0 1 0-4h.2A1.7 1.7 0 0 0 4 5.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 3.6V3a2 2 0 0 1 4 0v.2A1.7 1.7 0 0 0 17.2 5l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0 1.2 2.9H21a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z'), roles: ['admin'], primary: true },
  { href: '/reports', label: 'Reportes', icon: I('M4 19V5|M4 19h16|M8 16l3-4 3 2 4-6'), roles: ['admin'] },
  { href: '/admin/users', label: 'Usuarios', icon: I('M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z|M2 20a7 7 0 0 1 14 0|M17 11a3 3 0 1 0-1-5.8|M16 20h6a5 5 0 0 0-4-4.9'), roles: ['admin'] },
  { href: '/admin/audit-log', label: 'Bitácora', icon: I('M6 3h9l5 5v13H6z|M14 3v6h6|M9 13h6|M9 17h4'), roles: ['admin'] },
  { href: '/admin/db-setup', label: 'DB Setup', icon: I('M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3Z|M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5|M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6'), roles: ['admin'] },
  // Socio
  { href: '/audit', label: 'Auditoría', icon: I('M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z|M21 21l-4.3-4.3'), roles: ['socio'], primary: true },
  // Todos
  { href: '/profile', label: 'Perfil', icon: I('M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z|M5 21a7 7 0 0 1 14 0'), roles: ['admin', 'conductor', 'socio'], primary: true },
];

export function itemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((i) => i.roles.includes(role));
}
