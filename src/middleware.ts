import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle maintenance mode.
 * When MAINTENANCE_MODE is set to "true", all public routes are redirected
 * to the /maintenance page, except for allowed paths.
 */
export function middleware(request: NextRequest) {
  const maintenance = process.env.MAINTENANCE_MODE === 'true';
  if (!maintenance) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Allow list patterns
  const allowList = [
    '/maintenance',
    '/login',
    // admin and api routes are allowed as they start with these prefixes
    '/admin',
    '/api',
  ];

  const isAllowed = allowList.some((prefix) => pathname.startsWith(prefix));

  if (isAllowed) {
    return NextResponse.next();
  }

  // Redirect to maintenance page
  url.pathname = '/maintenance';
  return NextResponse.redirect(url);
}

// Apply middleware to all routes
export const config = {
  matcher: '/:path*',
};
