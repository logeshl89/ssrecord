import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to protect routes
export function middleware(request: NextRequest) {
  // Skip middleware for API auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Skip middleware for login page
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }
  
  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // If no token and not on login page, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Try to decode the token
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    // Token is valid, continue
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)',
  ],
};