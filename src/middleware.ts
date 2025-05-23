import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null;
  
interface UserJwtPayload extends JWTPayload {
  userId: string;
  role: string;
}

export const config = {
  matcher: [
    '/api/dashboard/:path*',
    '/api/user/profile',
    '/api/user/change-password',
    '/dashboard', // Add dashboard route to the matcher
  ],
};

async function verifyToken(token: string): Promise<UserJwtPayload | null> {
  if (!secretKey) {
    console.error('JWT_SECRET is not configured.');
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (typeof payload.userId === 'string' && typeof payload.role === 'string') {
      return payload as UserJwtPayload;
    }
    console.error('Invalid JWT payload structure:', payload);
    return null;
  } catch (error) {
    console.error('JWT Verification Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
  const isDashboardRoute = req.nextUrl.pathname === '/dashboard';

  // For dashboard route, get token from cookies if not in headers
  let tokenToUse = token;
  if (isDashboardRoute && !token) {
    tokenToUse = req.cookies.get('authToken')?.value;
  }

  if (!tokenToUse) {
    const message = 'Authentication required';
    if (isApiRoute) {
      return new Response(JSON.stringify({ message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    // For dashboard route, redirect to 404 instead of login if no token
    if (isDashboardRoute) {
      return NextResponse.redirect(new URL('/404', req.url));
    }
    
    // For other routes, redirect to login
    const loginUrl = new URL('/log-in', req.url);
    return NextResponse.redirect(loginUrl);
  }

  const decodedPayload = await verifyToken(tokenToUse);

  if (!decodedPayload) {
    const message = 'Invalid or expired token';
    if (isApiRoute) {
      return new Response(JSON.stringify({ message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    // For dashboard route, redirect to 404 if token is invalid
    if (isDashboardRoute) {
      return NextResponse.redirect(new URL('/404', req.url));
    }
    
    // For other routes, redirect to login with session expired error
    const loginUrl = new URL('/log-in', req.url);
    loginUrl.searchParams.set('error', 'session_expired');
    return NextResponse.redirect(loginUrl);
  }

  // Check for dashboard access - restrict to SUPER_ADMIN only
  if (isDashboardRoute && decodedPayload.role !== 'SUPER_ADMIN') {
    // Redirect non-admin users to 404 page
    return NextResponse.redirect(new URL('/404', req.url));
  }

  // Token is valid, attach user info to headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('X-User-Id', decodedPayload.userId);
  requestHeaders.set('X-User-Role', decodedPayload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}