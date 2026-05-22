import { NextResponse, type NextRequest } from 'next/server';
import { verifyUserJwt } from '@/lib/auth';

const socioAllowedPaths = [
  '/audit',
  '/profile',
  '/api/audit',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/auth/change-password',
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('buseta_session')?.value;
  if (!token) {
    return NextResponse.next();
  }

  try {
    const user = await verifyUserJwt(token);
    const pathname = request.nextUrl.pathname;

    if (user.role === 'socio') {
      const isAllowed = socioAllowedPaths.some((path) => pathname === path || pathname.startsWith(path + '/'));
      if (!isAllowed) {
        return NextResponse.redirect(new URL('/audit', request.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
