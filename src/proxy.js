import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request) {
	// 1. Session Token verify karein
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	const { pathname } = request.nextUrl;

	// 2. Bypass rules (System files & APIs)
	if (
		pathname.startsWith("/api/auth") ||
		pathname.startsWith("/_next") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	// Paths ko identify karein
	const isHomePage = pathname === "/"; // Yeh http://localhost:3000/ ko identify karega
	const isAuthPath = pathname.startsWith("/auth");

	// ==========================================
	// LOGIC 1: BINA LOGIN WALE USERS KE LIYE
	// ==========================================
	if (!token) {
		// Agar user Home Page ("/") ya Login/Register ("/auth") par hai, toh allow karo
		if (isHomePage || isAuthPath) {
			return NextResponse.next();
		}
		// Agar kisi aur page (jaise dashboard) par jaane ki koshish kare, toh login par bhej do
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	// ==========================================
	// LOGIC 2: LOGGED-IN USERS KE LIYE
	// ==========================================
	if (token) {
		// Agar login hone ke baad wapas login page par jaye, toh dashboard bhej do
		if (isAuthPath) {
			return NextResponse.redirect(
				new URL("/mess/dashboard", request.url),
			);
		}

		// --- SUBSCRIPTION EXPIRY CHECK ---
		const expiryDate = token.subscriptionEndDate
			? new Date(token.subscriptionEndDate)
			: null;
		const today = new Date();

		// Agar plan expire ho gaya hai aur wo renew page par nahi hai
		if (
			expiryDate &&
			today > expiryDate &&
			!pathname.startsWith("/mess/renew-plan")
		) {
			return NextResponse.redirect(
				new URL("/mess/renew-plan", request.url),
			);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
