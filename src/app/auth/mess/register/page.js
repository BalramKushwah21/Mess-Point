// src/app/auth/mess/register/page.js mein:
import { Suspense } from "react";
import RegisterForm from "@/components/registerForm"; // Aapka register form component

export default function RegisterPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<RegisterForm />
		</Suspense>
	);
}
