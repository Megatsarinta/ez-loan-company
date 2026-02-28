import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Protect /admin/* routes except /admin/login and /admin/setup
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname === '/admin/') {
      // Redirect /admin to /admin/dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }

    // Allow access to login and setup pages without authentication
    if (request.nextUrl.pathname === '/admin-login' || 
        request.nextUrl.pathname === '/admin-login/' ||
        request.nextUrl.pathname === '/admin/setup' || 
        request.nextUrl.pathname === '/admin/setup/') {
      return NextResponse.next();
    }

    // Check for admin session on protected routes
    const adminId = request.cookies.get('admin_id')?.value;
    const adminRole = request.cookies.get('admin_role')?.value;

    if (!adminId || !adminRole) {
      console.log('[v0] Unauthorized admin access attempt to', request.nextUrl.pathname);
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // Protect user routes from admins
  if (request.nextUrl.pathname.startsWith('/my-account') || 
      request.nextUrl.pathname.startsWith('/loan-application') ||
      request.nextUrl.pathname.startsWith('/personal-information') ||
      request.nextUrl.pathname.startsWith('/kyc-upload') ||
      request.nextUrl.pathname.startsWith('/signature')) {
    
    const adminId = request.cookies.get('admin_id')?.value;
    const userId = request.cookies.get('user_id')?.value;

    if (adminId && !userId) {
      // Admin trying to access user routes - redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/my-account/:path*',
    '/loan-application/:path*',
    '/personal-information/:path*',
    '/kyc-upload/:path*',
    '/signature/:path*',
  ],
};
