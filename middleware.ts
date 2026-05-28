import { NextResponse, type NextRequest } from 'next/server';
import { verifyUserJwt } from '@/lib/auth';

// Prefijos de PÁGINAS permitidos por rol. El admin no se restringe.
// /profile es común a todos. /api/* lo protege withAuth/withRole por endpoint.
const PAGE_ACCESS: Record<'conductor' | 'socio', string[]> = {
  conductor: ['/turno', '/gastos', '/shift', '/profile'],
  socio: ['/audit', '/profile'],
};

const LANDING: Record<'admin' | 'conductor' | 'socio', string> = {
  admin: '/dashboard',
  conductor: '/turno',
  socio: '/audit',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // No tocar API (protegido por endpoint), assets ni la pantalla de login.
  if (pathname === '/' || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('buseta_session')?.value;
  if (!token) return NextResponse.next();

  let role: 'admin' | 'conductor' | 'socio';
  try {
    role = (await verifyUserJwt(token)).role;
  } catch {
    return NextResponse.next();
  }

  if (role === 'admin') return NextResponse.next(); // acceso total

  const allowed = PAGE_ACCESS[role] ?? [];
  const ok = allowed.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!ok) {
    return NextResponse.redirect(new URL(LANDING[role], request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
