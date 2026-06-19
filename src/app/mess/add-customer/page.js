"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddCustomer() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// Form Data State
	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		address: "",
		plan: "Monthly",
		mealsPerDay: 2,
		deliveryType: "In Mess",
		startDate: "",
		paymentDate: "",
		numberOfDays: 30,
		totalAmount: 0, // Naya: Total Bill
		paidAmount: 0, // Naya: Kitna jama kiya
		remainingAmount: 0, // Naya: Auto-calculated udhaar
		paymentStatus: "Paid",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;

		let parsedValue = value;
		// Numbers wali fields ko integer mein convert karein
		if (
			[
				"numberOfDays",
				"mealsPerDay",
				"totalAmount",
				"paidAmount",
			].includes(name)
		) {
			parsedValue = parseInt(value) || 0;
		}

		setFormData((prev) => {
			const updatedData = { ...prev, [name]: parsedValue };

			// SMART LOGIC: Auto-calculate Remaining Amount
			if (name === "totalAmount" || name === "paidAmount") {
				const total =
					name === "totalAmount" ? parsedValue : prev.totalAmount;
				const paid =
					name === "paidAmount" ? parsedValue : prev.paidAmount;

				// Udhaar calculate karein (kabhi negative na ho isliye Math.max lagaya hai)
				const remaining = Math.max(total - paid, 0);
				updatedData.remainingAmount = remaining;

				// Payment status ko automatically set karein
				if (paid >= total && total > 0) {
					updatedData.paymentStatus = "Paid";
				} else if (paid === 0) {
					updatedData.paymentStatus = "Pending";
				} else {
					updatedData.paymentStatus = "Partial";
				}
			}

			// Agar user manually Payment Status change kare (Radio buttons se)
			if (name === "paymentStatus") {
				if (value === "Paid") {
					updatedData.paidAmount = prev.totalAmount;
					updatedData.remainingAmount = 0;
				} else if (value === "Pending") {
					updatedData.paidAmount = 0;
					updatedData.remainingAmount = prev.totalAmount;
				}
			}

			return updatedData;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage("");

		try {
			const response = await fetch("/api/customers/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Customer add nahi ho paya.");
			}

			setIsLoading(false);
			alert("Naya Customer successfully add ho gaya hai!");
			router.push("/mess/dashboard");
			router.refresh();
		} catch (error) {
			setErrorMessage(
				error.message ||
					"System mein kuch gadbad hai. Kripya baad mein try karein.",
			);
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-2xl">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Naya Customer Add Karein
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Apne tiffin service ke naye member ki details bharein
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
				<div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl border border-gray-100">
					{errorMessage && (
						<div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center">
							{errorMessage}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Personal Details */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Customer Ka Naam
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleChange}
									required
									placeholder="Jaise: Amit Kumar"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Phone Number (WhatsApp)
								</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									required
									placeholder="9876543210"
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700">
								Address (Ghar / Hostel)
							</label>
							<textarea
								name="address"
								rows={2}
								value={formData.address}
								onChange={handleChange}
								required
								placeholder="Room 102, ABC Hostel..."
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
							/>
						</div>

						<hr className="border-gray-200" />

						{/* Meal & Delivery Section */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Meals Per Day
								</label>
								<select
									name="mealsPerDay"
									value={formData.mealsPerDay}
									onChange={handleChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
								>
									<option value={1}>1 Time Meal</option>
									<option value={2}>2 Time Meal</option>
									<option value={3}>3 Time Meal</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Delivery Type
								</label>
								<select
									name="deliveryType"
									value={formData.deliveryType}
									onChange={handleChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
								>
									<option value="In Mess">
										In Mess (Dine-in)
									</option>
									<option value="Parcel">
										Parcel (Delivery)
									</option>
								</select>
							</div>
						</div>

						<hr className="border-gray-200" />

						{/* Dates & Duration Section */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Number of Days
								</label>
								<input
									type="number"
									name="numberOfDays"
									min="1"
									value={formData.numberOfDays}
									onChange={handleChange}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Mess Starts From
								</label>
								<input
									type="date"
									name="startDate"
									value={formData.startDate}
									onChange={handleChange}
									required
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Payment Date
								</label>
								<input
									type="date"
									name="paymentDate"
									value={formData.paymentDate}
									onChange={handleChange}
									className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
								/>
							</div>
						</div>

						<hr className="border-gray-200" />

						{/* SMART PAYMENT SECTION */}
						<div className="bg-orange-50 p-5 rounded-lg border border-orange-100">
							<h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-orange-200 pb-2">
								Billing & Payment
							</h3>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{/* Total Amount */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Total Amount (₹)
									</label>
									<input
										type="number"
										name="totalAmount"
										value={formData.totalAmount}
										onChange={handleChange}
										required
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm font-bold"
									/>
								</div>
								{/* Paid Amount */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Paid Amount (Jama ₹)
									</label>
									<input
										type="number"
										name="paidAmount"
										value={formData.paidAmount}
										onChange={handleChange}
										required
										className="mt-1 block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm font-bold text-green-700"
									/>
								</div>
								{/* Remaining Amount (Read Only) */}
								<div>
									<label className="block text-sm font-medium text-gray-700">
										Remaining (Udhaar ₹)
									</label>
									<input
										type="number"
										name="remainingAmount"
										value={formData.remainingAmount}
										readOnly
										disabled
										className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm bg-gray-100 text-red-600 font-bold sm:text-sm cursor-not-allowed"
									/>
								</div>
							</div>

							<div className="mt-4">
								<label className="block text-sm font-bold text-gray-700">
									Payment Status
								</label>
								<div className="mt-2 flex items-center space-x-6">
									<label className="inline-flex items-center">
										<input
											type="radio"
											name="paymentStatus"
											value="Paid"
											checked={
												formData.paymentStatus ===
												"Paid"
											}
											onChange={handleChange}
											className="form-radio h-4 w-4 text-green-600 focus:ring-green-500"
										/>
										<span className="ml-2 text-sm text-gray-700 font-medium">
											Fully Paid
										</span>
									</label>
									<label className="inline-flex items-center">
										<input
											type="radio"
											name="paymentStatus"
											value="Partial"
											checked={
												formData.paymentStatus ===
												"Partial"
											}
											onChange={handleChange}
											className="form-radio h-4 w-4 text-yellow-600 focus:ring-yellow-500"
										/>
										<span className="ml-2 text-sm text-gray-700 font-medium">
											Partial Paid
										</span>
									</label>
									<label className="inline-flex items-center">
										<input
											type="radio"
											name="paymentStatus"
											value="Pending"
											checked={
												formData.paymentStatus ===
												"Pending"
											}
											onChange={handleChange}
											className="form-radio h-4 w-4 text-red-600 focus:ring-red-500"
										/>
										<span className="ml-2 text-sm text-gray-700 font-medium">
											Pending (Udhaar)
										</span>
									</label>
								</div>
							</div>
						</div>

						{/* Buttons */}
						<div className="flex justify-between pt-4 border-t border-gray-200">
							<Link
								href="/dashboard"
								className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition"
							>
								Cancel
							</Link>
							<button
								type="submit"
								disabled={isLoading}
								className="px-6 py-2 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-orange-600 hover:bg-orange-700 transition disabled:bg-orange-400"
							>
								{isLoading ? "Saving..." : "Add Customer"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
