"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddEmployee() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// Form Data State
	const [formData, setFormData] = useState({
		name: "",
		role: "Cook", // Default role
		baseSalary: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "baseSalary" ? parseInt(value) || "" : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setErrorMessage("");

		try {
			const response = await fetch("/api/employees/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Employee add nahi ho paya.");
			}

			setIsLoading(false);
			alert("Naya Employee successfully add ho gaya hai!");
			router.push("/mess/dashboard");
			router.refresh();
		} catch (error) {
			setErrorMessage(error.message || "System mein kuch gadbad hai.");
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Naya Staff Add Karein
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Apne mess ke naye employee ki details bharein
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-6 shadow-xl sm:rounded-xl border border-gray-100">
					{errorMessage && (
						<div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center">
							{errorMessage}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Employee Name */}
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Employee Ka Naam
							</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								placeholder="Jaise: Raju Kumar"
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
							/>
						</div>

						{/* Role Dropdown */}
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Kaam (Role)
							</label>
							<select
								name="role"
								value={formData.role}
								onChange={handleChange}
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
							>
								<option value="Cook">Cook (Rasoiyya)</option>
								<option value="Delivery Boy">
									Delivery Boy
								</option>
								<option value="Helper">Helper / Cleaner</option>
								<option value="Manager">Manager</option>
							</select>
						</div>

						{/* Base Salary */}
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Monthly Salary (₹)
							</label>
							<input
								type="number"
								name="baseSalary"
								value={formData.baseSalary}
								onChange={handleChange}
								required
								min="0"
								placeholder="Jaise: 15000"
								className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
							/>
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
								{isLoading ? "Saving..." : "Add Employee"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
