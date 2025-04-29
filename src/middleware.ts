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
    '/api/user/change-password'
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

  if (!token) {
    const message = 'Authentication required';
    if (isApiRoute) {
      return new Response(JSON.stringify({ message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const loginUrl = new URL('/log-in', req.url);
    return NextResponse.redirect(loginUrl);
  }

  const decodedPayload = await verifyToken(token);

  if (!decodedPayload) {
    const message = 'Invalid or expired token';
    if (isApiRoute) {
      return new Response(JSON.stringify({ message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const loginUrl = new URL('/log-in', req.url);
    loginUrl.searchParams.set('error', 'session_expired');
    return NextResponse.redirect(loginUrl);
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