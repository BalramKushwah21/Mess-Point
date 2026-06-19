import { NextResponse } from "next/server";

export function proxy(request) {
	const token = request.cookies.get("next-auth.session-token");
	const { pathname } = request.nextUrl;

	// 1. Agar user pehle se login page par hai, toh access karne dein
	if (pathname.startsWith("/auth/login")) {
		return NextResponse.next();
	}

	// 3. Agar token nahi hai, toh login page par redirect karein
	if (!token) {
		return NextResponse.redirect(new URL("/auth/login", request.url));
	}

	return NextResponse.next();
}

// 4. Matcher configuration
export const config = {
	matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
