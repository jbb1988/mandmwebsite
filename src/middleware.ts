import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only enforce password gate in production
  const isProduction = process.env.NODE_ENV === 'production';
  const previewMode = process.env.PREVIEW_MODE === 'true';

  // Skip middleware if not in production preview mode
  if (!isProduction || !previewMode) {
    return NextResponse.next();
  }

  // Allow access to auth routes, static files, and SEO routes
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/auth/gate') ||
    pathname.startsWith('/auth/reset-password') ||
    pathname.startsWith('/api/auth/verify-gate') ||
    pathname.startsWith('/api/auth/callback') ||
    pathname.startsWith('/api/auth/reset-password') ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public') ||
    // SEO routes - allow public access for search engines
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const authCookie = request.cookies.get('preview_auth');

  if (!authCookie || authCookie.value !== 'authenticated') {
    // Redirect to password gate with return URL
    const url = new URL('/auth/gate', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // User is authenticated, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
