import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; 

const JWT_SECRET = process.env.JWT_SECRET;

// Define which paths require authentication
export const config = {
  matcher: ['/api/dashboard/:path*', '/api/user/:path*'],
};

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    // For API routes, return JSON error
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ message: 'Authentication required' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    // For pages, redirect to login
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    if (!JWT_SECRET) throw new Error('JWT_SECRET not configured');
    const secret = new TextEncoder().encode(JWT_SECRET);
    // Verify token using 'jose' library
    await jwtVerify(token, secret);

    // Token is valid, allow request to proceed
    // Optionally add headers to pass decoded info, though less direct than modifying req object
    const response = NextResponse.next();
    // response.headers.set('x-user-id', decoded.payload.userId); // Example
    return response;

  } catch (error) {
    console.error('Middleware Auth Error:', error);
    // Handle invalid/expired token
    if (req.nextUrl.pathname.startsWith('/api/')) {
       return new Response(JSON.stringify({ message: 'Invalid or expired token' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
     const loginUrl = new URL('/login', req.url);
     loginUrl.searchParams.set('error', 'session_expired'); // Optional: add error query param
     return NextResponse.redirect(loginUrl);
  }
}