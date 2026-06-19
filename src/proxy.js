// src/proxy.js
import { NextResponse } from "next/server";

export function proxy(request) {
	const token = request.cookies.get("next-auth.session-token");

	// Agar token nahi hai, toh user ko login page par bhejen
	if (!token) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return NextResponse.next();
}

// Yeh config sabhi routes ko protect karega, sirf login aur assets ko chhod kar
export const config = {
	matcher: [
		"/((?!login|api/auth|register|_next/static|_next/image|favicon.ico).*)",
	],
};
