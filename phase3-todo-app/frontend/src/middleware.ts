/**
 * Next.js middleware for route protection.
 * T022: Protect /todos routes, redirect unauthenticated users to /login.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for authentication session in cookies/localStorage
  // Note: In a real app with Better Auth, this would check for secure httpOnly cookies
  const authSession = request.cookies.get('auth_session');

  // Protect /todos routes
  if (request.nextUrl.pathname.startsWith('/todos')) {
    if (!authSession) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Allow access
  return NextResponse.next();
}

export const config = {
  matcher: '/todos/:path*',
};
