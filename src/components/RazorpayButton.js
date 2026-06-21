"use client";
import { useState } from "react";

export default function RazorpayButton({ amount, messId }) {
	const [loading, setLoading] = useState(false);

	const makePayment = async () => {
		setLoading(true);

		try {
			// 1. Razorpay ka script load karein
			const res = await loadScript(
				"https://checkout.razorpay.com/v1/checkout.js",
			);
			if (!res) {
				alert(
					"Razorpay SDK load hone mein error aayi. Apna connection check karein.",
				);
				setLoading(false);
				return;
			}

			// 2. Backend se Naya Order banwayein (Aapne Step 3 mein banaya tha)
			const data = await fetch("/api/razorpay/create-order", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount, messId }),
			}).then((t) => t.json());

			if (!data.orderId) {
				alert("Order create nahi ho paya!");
				setLoading(false);
				return;
			}

			// 3. Razorpay Popup Options Set karein
			const options = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Frontend ke liye env variable
				amount: data.amount,
				currency: data.currency,
				name: "Mess-Point SaaS",
				description: "1 Month Subscription",
				order_id: data.orderId,

				handler: async function (response) {
					// 4. Payment successful hone par verify karein
					const verifyData = await fetch("/api/razorpay/verify", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_order_id: response.razorpay_order_id,
							razorpay_signature: response.razorpay_signature,
							messId: messId,
						}),
					}).then((t) => t.json());

					if (verifyData.message) {
						alert(
							"Payment Successful! Aapka plan renew ho gaya hai.",
						);
						window.location.reload(); // Dashboard ko refresh kar dein
					} else {
						alert("Payment verify nahi ho payi.");
					}
				},
				theme: {
					color: "#3399cc",
				},
			};

			const paymentObject = new window.Razorpay(options);
			paymentObject.open();
		} catch (error) {
			console.error("Payment error:", error);
		}

		setLoading(false);
	};

	return (
		<button
			onClick={makePayment}
			disabled={loading}
			className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
		>
			{loading ? "Processing..." : `Pay ₹${amount}`}
		</button>
	);
}

// Razorpay script load karne ka function
const loadScript = (src) => {
	return new Promise((resolve) => {
		const script = document.createElement("script");
		script.src = src;
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
};
