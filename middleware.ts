import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { AUTH_ROUTES, PROTECTED_ROUTES, ROUTES } from '@/constants/routes';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Not logged in, trying to reach a protected page -> send to login,
  // remembering where they were headed.
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL(ROUTES.login, request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Already logged in, trying to reach an auth page -> send to dashboard.
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, images, fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
