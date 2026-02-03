/**
 * Next.js middleware for route protection.
 * T022: Protect /todos routes, redirect unauthenticated users to /login.
 *
 * Note: Since we use localStorage for token storage (client-side only),
 * the actual authentication check happens in the todos page component.
 * This middleware is kept minimal to allow the page to load and handle auth.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all requests to proceed - auth is handled client-side
  // The todos page will redirect to login if no token is found in localStorage
  return NextResponse.next();
}

export const config = {
  matcher: ['/todos/:path*'],
};
