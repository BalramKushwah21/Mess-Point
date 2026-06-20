import { NextResponse } from "next/server";

export function proxy(request) {
	// FIX: Localhost aur Vercel (HTTPS) dono ki cookies ko check karein
	const token =
		request.cookies.get("next-auth.session-token") ||
		request.cookies.get("__Secure-next-auth.session-token");

	const { pathname } = request.nextUrl;

	// 1. Next.js ke system files aur APIs ko bypass karein
	if (
		pathname.startsWith("/api/auth") ||
		pathname.startsWith("/_next") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// 2. Paths ko categories mein divide karein
	const isHomePage = pathname === "/";
	const isAuthPath = pathname.startsWith("/auth"); // isme login aur register dono aayenge

	// 3. Smart Redirect: Agar user pehle se login hai aur auth pages par jane ki koshish kare
	if (token && isAuthPath) {
		return NextResponse.redirect(new URL("/mess/dashboard", request.url));
	}

	// 4. Protection Logic: Agar token nahi hai aur user secure pages (dashboard etc.) par jana chahe
	if (!token && !isHomePage && !isAuthPath) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	// Baki sabhi allow karein (Logged-in users internal pages par aur Guests public pages par)
	return NextResponse.next();
}

// 5. Matcher Configuration
export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
