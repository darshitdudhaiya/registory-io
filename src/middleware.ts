import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isPublicPath = path === '/login' || path === '/register';
  const isProtectedPath = path === '/dashboard' || path === '/profile';
  
  const token = request.cookies.get('session_token')?.value;

  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.nextUrl.origin);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
  }

  if (path === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
    } else {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard',
    '/profile',
  ],
};
