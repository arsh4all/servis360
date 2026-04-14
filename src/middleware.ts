import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAccessToken } from './lib/jwt';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/worker', '/admin', '/booking'];

// Routes only for guests (redirect if logged in)
const AUTH_ROUTES = ['/login', '/register'];

// Admin-only routes
const ADMIN_ROUTES = ['/admin'];

// Worker-only routes
const WORKER_ROUTES = ['/worker'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('access_token')?.value;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isWorkerRoute = WORKER_ROUTES.some((route) => pathname.startsWith(route));

  // If not logged in and trying to access protected route
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    try {
      const payload = await verifyAccessToken(token);

      // If logged in and trying to access auth routes, redirect to dashboard
      if (isAuthRoute) {
        const role = payload.role;
        if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
        if (role === 'WORKER') return NextResponse.redirect(new URL('/worker', request.url));
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Role-based access control
      if (isAdminRoute && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (isWorkerRoute && payload.role !== 'WORKER' && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Add user info to headers for server components
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-email', payload.email);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      // Invalid token — clear cookie and redirect to login if on protected route
      const response = isProtected
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.next();
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
