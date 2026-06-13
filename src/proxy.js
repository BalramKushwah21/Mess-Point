import { NextResponse } from "next/server";

export async function proxy(request) {
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

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (userId && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!userId && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!userId && pathname.startsWith("/api/protected")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard/:path*",
    "/subscription/:path*",
    "/billing/:path*",
    "/settings/:path*",
    "/api/:path*",
  ],
};
