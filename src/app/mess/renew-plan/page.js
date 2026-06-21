"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function RenewPlan() {
	// 1. Apni Details Yahan Daalein
	const adminWhatsApp = "9285022678";
	const upiId = "baldau81@ybl"; // Apna asli UPI ID
	const payeeName = "Mess Point"; // Apna Business/Mess ka naam

	// 2. Plans ka data define karein
	const plans = {
		basic: { name: "Basic Plan (1 Month)", amount: "299" },
		pro: { name: "Pro Plan (3 Months)", amount: "799" },
		premium: { name: "Premium Plan (6 Months)", amount: "1499" },
	};

	// 3. State for selected plan (Default 'basic' rahega)
	const [selectedPlanKey, setSelectedPlanKey] = useState("basic");

	// Current plan ki details nikaalein
	const currentPlan = plans[selectedPlanKey];
	const amount = currentPlan.amount;

	// 4. Dynamic Links Generate karna
	const upiLink = `upi://pay?pa=${upiId}&pn=${payeeName}&am=${amount}&cu=INR`;

	// WhatsApp message mein selected plan ka naam aur amount add kiya hai
	const message = encodeURIComponent(
		`Hello, maine apne Mess-Point account ke liye ${currentPlan.name} (₹${amount}) ka payment kar diya hai. Kripya mera account activate kar dein.`,
	);

	return (
		<div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
			<div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border-t-4 border-red-500">
				<div className="text-red-500 mb-4 flex justify-center">
					<svg
						className="w-16 h-16"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				</div>

				<h1 className="text-2xl font-bold text-gray-800 mb-2">
					Subscription Expired
				</h1>
				<p className="text-gray-600 mb-6">
					Aapke Mess-Point account ka plan expire ho gaya hai. Apna
					dashboard wapas access karne ke liye kripya plan renew
					karein.
				</p>

				<div className="bg-blue-50 border border-blue-100 p-5 rounded-lg mb-6 text-left">
					<h2 className="font-semibold text-blue-800 mb-4 text-center border-b border-blue-200 pb-2">
						Renewal Process
					</h2>

					{/* PLAN SELECTION DROPDOWN */}
					<div className="mb-5">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Select Your Plan:
						</label>
						<select
							value={selectedPlanKey}
							onChange={(e) => setSelectedPlanKey(e.target.value)}
							className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
						>
							<option value="basic">
								Basic Plan (1 Month) - ₹299
							</option>
							<option value="pro">
								Pro Plan (3 Months) - ₹799
							</option>
							<option value="premium">
								Premium Plan (6 Months) - ₹1499
							</option>
						</select>
					</div>

					<p className="text-sm text-gray-700 mb-2">
						1. Direct UPI App se pay karein:
					</p>
					{/* DIRECT UPI APP BUTTON (Amount Dynamically Update Hoga) */}
					<a
						href={upiLink}
						className="flex items-center justify-center w-full bg-indigo-600 text-white py-2.5 rounded-md hover:bg-indigo-700 transition-colors font-semibold mb-4 shadow-sm"
					>
						Pay ₹{amount} via UPI App
					</a>

					<p className="text-sm text-gray-700 mb-2">
						2. Payment ke baad screenshot bhejein:
					</p>
					{/* WHATSAPP BUTTON */}
					<a
						href={`https://wa.me/${adminWhatsApp}?text=${message}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center w-full bg-green-500 text-white py-2.5 rounded-md hover:bg-green-600 transition-colors font-semibold shadow-sm"
					>
						Send Screenshot on WhatsApp
					</a>
				</div>

				<div className="text-xs text-gray-500 mb-6 px-2">
					<p>
						<strong>Note:</strong> Jab Admin aapka payment verify
						karke account activate kar denge, uske baad aapko yahan
						se Logout karke dobara Login karna hoga.
					</p>
				</div>

				<button
					onClick={() => signOut({ callbackUrl: "/auth/login" })}
					className="w-full bg-gray-200 text-gray-800 py-2.5 rounded-md hover:bg-gray-300 transition-colors font-semibold"
				>
					Log Out
				</button>
			</div>
		</div>
	);
}
