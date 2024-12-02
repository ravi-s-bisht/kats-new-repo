import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

// Extend NextRequest to include user property
interface CustomNextRequest extends NextRequest {
  user?: any; // Define the type of user as needed
}

export async function middleware(req: CustomNextRequest) {
  const { pathname } = req.nextUrl;

  // Exclude `/api/google-login` from this middleware
  const excludedPaths = ['/api/google-login', '/api/connect', '/api/contact', '/api/hume'];
  if (excludedPaths.includes(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api')) {
    const authHeader = req.headers.get('authorization') || req.cookies.get('token') || req.body.token || req.query.token || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];

    try {
      if (!SECRET_KEY) {
        throw new Error('JWT_SECRET is not defined');
      }
      const user = jwt.verify(token, SECRET_KEY);
      req.user = user; // Attach user to the request for later use
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'], // Match all API routes
};