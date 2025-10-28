import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/', // Redirect ke homepage jika belum login
    },
  }
);

// Protected routes
export const config = {
  matcher: [
    '/my-recipes/:path*',
    '/favorites/:path*',
    '/profile/:path*',
    '/settings/:path*',
  ],
};
