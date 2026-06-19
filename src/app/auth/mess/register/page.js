"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterMess() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [selectedPlan, setSelectedPlan] = useState("basic");
	const [step, setStep] = useState(1);

	// Form Data State
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		whatsapp: "",
		password: "",
		messName: "",
		address: "",
		customDomain: "",
	});

	// Loading & Error States
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// URL se plan fetch karna (e.g., ?plan=pro)
	useEffect(() => {
		const plan = searchParams.get("plan");
		if (plan) setSelectedPlan(plan);
	}, [searchParams]);

	// Handle Input Changes (Plain JavaScript - Fixed Duplication)
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Auto-generate slug from Mess Name
		if (name === "messName") {
			const generatedSlug = value
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)+/g, "");
			setFormData((prev) => ({
				...prev,
				customDomain: generatedSlug,
				messName: value,
			}));
		}
	};

	const nextStep = () => {
		setStep((prev) => prev + 1);
		setErrorMessage(""); // Clear error moving forward
	};
	const prevStep = () => {
		setStep((prev) => prev - 1);
		setErrorMessage(""); // Clear error moving backward
	};

	// Corrected & Complete Backend Submission Logic
	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage("");

		try {
			// Include selected plan into the final payload
			const finalPayload = {
				...formData,
				plan: selectedPlan,
			};

			const response = await fetch("/api/auth/mess/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(finalPayload),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(
					data.error || "Registration failed! System mein error hai.",
				);
			}

			// Success logic
			alert(
				"Registration Successful! Apna dashboard access karne ke liye login karein.",
			);
			router.push("/auth/login");
			router.refresh();
		} catch (err) {
			setErrorMessage(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
			{/* Header */}
			<div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
				<Link href="/">
					<h1 className="text-4xl font-extrabold text-orange-600 cursor-pointer">
						Mess-Point
					</h1>
				</Link>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Apna Mess Register Karein
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Step {step} of 3
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
				<div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-100">
					{/* Progress Bar */}
					<div className="mb-8 relative">
						<div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-orange-100">
							<div
								style={{ width: `${(step / 3) * 100}%` }}
								className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-600 transition-all duration-500"
							></div>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* ================= STEP 1: OWNER DETAILS ================= */}
						{step === 1 && (
							<div className="animate-fadeIn">
								<h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
									Owner Details
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											First Name
										</label>
										<input
											type="text"
											name="firstName"
											value={formData.firstName}
											onChange={handleChange}
											required
											placeholder="Rahul"
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Last Name
										</label>
										<input
											type="text"
											name="lastName"
											value={formData.lastName}
											onChange={handleChange}
											required
											placeholder="Sharma"
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
										/>
									</div>
								</div>

								<div className="mt-4">
									<label className="block text-sm font-medium text-gray-700">
										Email Address
									</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
										placeholder="rahul@example.com"
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
									/>
								</div>

								<div className="mt-4">
									<label className="block text-sm font-medium text-gray-700">
										WhatsApp Number
									</label>
									<input
										type="tel"
										name="whatsapp"
										value={formData.whatsapp}
										onChange={handleChange}
										required
										placeholder="9876543210"
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
									/>
								</div>

								<div className="mt-4">
									<label className="block text-sm font-medium text-gray-700">
										Account Password
									</label>
									<input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										required
										placeholder="••••••••"
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
									/>
								</div>
							</div>
						)}

						{/* ================= STEP 2: MESS DETAILS ================= */}
						{step === 2 && (
							<div className="animate-fadeIn">
								<h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
									Mess & Business Details
								</h3>

								<div>
									<label className="block text-sm font-medium text-gray-700">
										Mess Ka Naam
									</label>
									<input
										type="text"
										name="messName"
										value={formData.messName}
										onChange={handleChange}
										required
										placeholder="Sharma Tiffin Center"
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
									/>
								</div>

								<div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Aapka Custom Link (Slug)
									</label>
									<div className="flex items-center">
										<span className="text-gray-500 text-sm">
											messpoint.com/
										</span>
										<input
											type="text"
											name="customDomain"
											value={formData.customDomain}
											onChange={handleChange}
											required
											className="block w-full px-2 py-1 text-sm border-b border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-orange-600 font-bold"
										/>
									</div>
								</div>

								<div className="mt-4">
									<label className="block text-sm font-medium text-gray-700">
										Mess Ka Pata (Address)
									</label>
									<textarea
										name="address"
										rows={3}
										value={formData.address}
										onChange={handleChange}
										required
										placeholder="Poora address likhein..."
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
									/>
								</div>
							</div>
						)}

						{/* ================= STEP 3: PLAN CONFIRMATION ================= */}
						{step === 3 && (
							<div className="animate-fadeIn text-center">
								<div className="text-6xl mb-4">🎉</div>
								<h3 className="text-xl font-bold text-gray-800 mb-2">
									Ready to Launch!
								</h3>
								<p className="text-gray-600 mb-6 text-sm">
									Aapki details save ho gayi hain. Kripya apna
									plan confirm karein.
								</p>

								{/* Dynamic Error Display */}
								{errorMessage && (
									<div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium">
										{errorMessage}
									</div>
								)}

								<div className="bg-orange-50 border border-orange-200 text-orange-800 p-6 rounded-xl font-medium mb-6">
									<p className="text-sm text-orange-600 mb-1">
										Selected Subscription Plan
									</p>
									<p className="text-3xl font-extrabold uppercase">
										{selectedPlan} Plan
									</p>
									<Link
										href="/#features"
										className="inline-block mt-3 text-sm text-orange-600 underline hover:text-orange-700"
									>
										Change Plan
									</Link>
								</div>

								<div className="text-left text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-200">
									<p>
										<strong>Owner:</strong>{" "}
										{formData.firstName} {formData.lastName}
									</p>
									<p>
										<strong>Mess:</strong>{" "}
										{formData.messName}
									</p>
									<p>
										<strong>Link:</strong> messpoint.com/
										{formData.slug}
									</p>
								</div>
							</div>
						)}

						{/* Navigation Buttons */}
						<div className="flex justify-between pt-4">
							{step > 1 ? (
								<button
									type="button"
									onClick={prevStep}
									disabled={isLoading}
									className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50"
								>
									Back
								</button>
							) : (
								<div></div>
							)}

							{step < 3 ? (
								<button
									type="button"
									onClick={nextStep}
									className="px-6 py-2 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-orange-600 hover:bg-orange-700 transition"
								>
									Next Step
								</button>
							) : (
								<button
									type="submit"
									disabled={isLoading}
									className="px-6 py-2 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-green-600 hover:bg-green-700 transition disabled:bg-green-400"
								>
									{isLoading
										? "Registering..."
										: "Complete Registration"}
								</button>
							)}
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
