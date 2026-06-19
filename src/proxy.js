import { NextResponse } from "next/server";

export function proxy(request) {
	const token = request.cookies.get("next-auth.session-token");
	const { pathname } = request.nextUrl;

	// 1. Next.js ke system files aur APIs ko bypass karein
	if (
		pathname.startsWith("/api/auth") ||
		pathname.startsWith("/_next") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// 2. Define karein public paths (Login aur Register)
	// startsWith('/auth') use karne se /auth/login aur /auth/mess/register dono cover ho jayenge
	const isPublicPath = pathname.startsWith("/auth");

	// 3. Smart Redirect: Agar user pehle se login hai aur login/register par jaye
	if (token && isPublicPath) {
		return NextResponse.redirect(new URL("/mess/dashboard", request.url));
	}

	// 4. Protection Logic: Agar token nahi hai aur page public bhi nahi hai
	if (!token && !isPublicPath) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	// Baki sabhi cases mein aage badhne dein
	return NextResponse.next();
}

// 5. Matcher Configuration
export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
