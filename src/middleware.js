import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get userId from cookie
  const userId = request.cookies.get("userId")?.value;

  // Public routes (no auth required)
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/pricing",
    "/about",
    "/contact",
  ];

  // Auth routes (should redirect if already logged in)
  const authRoutes = ["/login", "/register", "/forgot-password"];

  // Protected routes (require auth)
  const protectedRoutes = ["/dashboard", "/subscription", "/billing", "/settings"];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is auth-related
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If user is authenticated and tries to access auth routes, redirect to dashboard
  if (userId && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (!userId && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is not authenticated and tries to access API routes, reject with 401
  if (!userId && pathname.startsWith("/api/protected")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow all other requests
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Auth routes
    "/login",
    "/register",
    "/forgot-password",
    // Protected routes
    "/dashboard/:path*",
    "/subscription/:path*",
    "/billing/:path*",
    "/settings/:path*",
    // API routes
    "/api/:path*",
  ],
};
