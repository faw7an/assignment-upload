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
    '/dashboard', // Add dashboard route to be protected
    '/dashboard/:path*'
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
  // Check for token in authorization header or cookies
  const authHeader = req.headers.get('authorization');
  let token = authHeader?.split(' ')[1];
  
  // If no token in header, try to get it from cookies
  if (!token) {
    token = req.cookies.get('authToken')?.value;
  }
  
  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
  const isDashboardRoute = req.nextUrl.pathname === '/dashboard' || req.nextUrl.pathname.startsWith('/dashboard/');

  // If no token found, handle accordingly
  if (!token) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ message: 'Authentication required' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } });
    } else {
      // Redirect to login page
      const loginUrl = new URL('/log-in', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Verify the token
  const decodedPayload = await verifyToken(token);
  
  if (!decodedPayload) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ message: 'Invalid or expired token' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } });
    } else {
      // Redirect with error
      const loginUrl = new URL('/log-in', req.url);
      loginUrl.searchParams.set('error', 'session_expired');
      return NextResponse.redirect(loginUrl);
    }
  }

  // For dashboard routes, check if user is SUPER_ADMIN
  if (isDashboardRoute && decodedPayload.role !== 'SUPER_ADMIN') {
    // If not super admin, redirect to appropriate page
    if (decodedPayload.role === 'STUDENT') {
      return NextResponse.redirect(new URL('/404', req.url));
    } else {
      // Default fallback for any other roles
      return NextResponse.redirect(new URL('/404', req.url));
    }
  }

  // Token is valid, attach user info to headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('X-User-Id', decodedPayload.userId);
  requestHeaders.set('X-User-Role', decodedPayload.role);

  // Set token as a cookie for client-side access if it's not already there
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!req.cookies.has('authToken')) {
    response.cookies.set('authToken', token, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/'
    });
  }

  return response;
}