"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MessLogin() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage("");

		try {
			// NextAuth ka signIn method call kar rahe hain
			const res = await signIn("credentials", {
				redirect: false,
				email: formData.email,
				password: formData.password,
			});

			if (res?.error) {
				// Agar backend se koi error aata hai (galat email/password)
				setErrorMessage(res.error);
				setIsLoading(false);
			} else {
				// Login successful hone par dashboard bhejein
				router.push("/mess/dashboard");
				router.refresh(); // Session update karne ke liye
			}
		} catch (error) {
			setErrorMessage(
				"System mein kuch gadbad hai. Kripya baad mein try karein.",
			);
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Mess-Point
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Apne Mess Dashboard mein login karein
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit}>
						{/* Email Input */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email Address
							</label>
							<div className="mt-1">
								<input
									id="email"
									name="email"
									type="email"
									required
									value={formData.email}
									onChange={handleChange}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
									placeholder="owner@example.com"
								/>
							</div>
						</div>

						{/* Password Input */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<div className="mt-1">
								<input
									id="password"
									name="password"
									type="password"
									required
									value={formData.password}
									onChange={handleChange}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
									placeholder="••••••••"
								/>
							</div>
						</div>

						{/* Error Message Display */}
						{errorMessage && (
							<div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
								{errorMessage}
							</div>
						)}

						{/* Submit Button */}
						<div>
							<button
								type="submit"
								disabled={isLoading}
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-400 transition-colors"
							>
								{isLoading ? "Verifying..." : "Sign In"}
							</button>
						</div>
					</form>

					{/* Registration Link */}
					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">
									Naya Mess register karna hai?
								</span>
							</div>
						</div>

						<div className="mt-6 text-center">
							<Link
								href="/auth/mess/register"
								className="font-medium text-orange-600 hover:text-orange-500"
							>
								Naya Account Banayein
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
