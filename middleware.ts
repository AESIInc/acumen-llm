import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith('/ping')) {
    return new Response('pong', { status: 200 });
  }

  // Handle Supabase auth routes
  if (pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Handle API routes - let them through for now
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Update the session and handle authentication
  const response = await updateSession(request);

  // If updateSession returns a redirect, use it
  if (response.headers.get('location')) {
    return response;
  }

  // Handle specific redirects for authenticated users
  const user = request.cookies.get('sb-access-token');
  if (user && ['/auth/login', '/auth/sign-up'].includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/chat/:id',
    '/api/:path*',
    '/auth/login',
    '/auth/sign-up',
    '/protected',

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
