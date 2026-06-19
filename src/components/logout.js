"use client"; // Client component hona zaruri hai
import { signOut } from "next-auth/react";

export default function LogoutButton() {
	return (
		<button
			onClick={() => signOut({ callbackUrl: "/auth/login" })}
			className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
		>
			Logout
		</button>
	);
}
