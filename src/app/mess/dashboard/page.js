"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logout from "@/components/logout";

export default function Dashboard() {
	const router = useRouter();

	function addCustomer() {
		router.push("/mess/add-customer");
	}

	function addEmployee() {
		router.push("/mess/add-employee");
	}

	const [activeTab, setActiveTab] = useState("customers");
	const [searchQuery, setSearchQuery] = useState("");

	// States for data
	const [stats, setStats] = useState({
		total: 0,
		active: 0,
		expiring: 0,
		expired: 0,
	});
	const [customers, setCustomers] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [parcels, setParcels] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// ============= EDIT & RENEW MODAL STATES =============
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editFormData, setEditFormData] = useState({});
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		setIsLoading(true);
		try {
			const res = await fetch("/api/dashboard");
			if (res.ok) {
				const data = await res.json();
				setStats(data.stats);
				setCustomers(data.customers);
				setEmployees(data.employees);
				setParcels(data.parcels);
			}
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Modal pre-fill logic
	const openEditModal = (customer) => {
		setEditFormData({
			id: customer.id,
			name: customer.name,
			phone: customer.phone,
			address: customer.address,
			plan: customer.plan,
			mealsPerDay: customer.mealsPerDay,
			deliveryType: customer.deliveryType,

			addedDays: 0,
			billAmount: 0,
			paidAmount: 0,
			paymentStatus: "Paid",

			existingRemaining: customer.remainingAmount,
		});
		setIsEditModalOpen(true);
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		let parsedValue = [
			"addedDays",
			"billAmount",
			"paidAmount",
			"mealsPerDay",
		].includes(name)
			? parseInt(value) || 0
			: value;

		setEditFormData((prev) => {
			const updated = { ...prev, [name]: parsedValue };

			if (name === "billAmount" || name === "paidAmount") {
				const bill =
					name === "billAmount" ? parsedValue : prev.billAmount;
				const paid =
					name === "paidAmount" ? parsedValue : prev.paidAmount;
				if (paid >= bill && bill > 0) updated.paymentStatus = "Paid";
				else if (paid === 0) updated.paymentStatus = "Pending";
				else updated.paymentStatus = "Partial";
			}
			return updated;
		});
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		try {
			const response = await fetch("/api/customers/renew", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editFormData),
			});
			if (response.ok) {
				alert("Customer details updated aur record save ho gaya!");
				setIsEditModalOpen(false);
				fetchDashboardData();
			} else {
				alert("Error saving data.");
			}
		} catch (error) {
			alert("System error!");
		} finally {
			setIsSaving(false);
		}
	};

	// Filters
	const filteredCustomers = customers.filter(
		(c) =>
			c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			c.phone.includes(searchQuery),
	);
	const filteredEmployees = employees.filter(
		(emp) =>
			emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			emp.role.toLowerCase().includes(searchQuery.toLowerCase()),
	);
	const filteredParcels = parcels.filter(
		(p) =>
			p.customer?.name
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			p.customer?.phone.includes(searchQuery),
	);

	if (isLoading)
		return (
			<div className="min-h-screen flex items-center justify-center text-orange-600 font-bold text-xl">
				Loading Dashboard Data...
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
			{/* Sidebar Navigation */}
			<aside className="w-full md:w-64 bg-white shadow-md flex-shrink-0">
				<div className="p-6 border-b">
					<h2 className="text-2xl font-extrabold text-orange-600">
						Mess-Point
					</h2>
					<p className="text-sm text-gray-500">Dashboard</p>
				</div>
				<nav className="p-4 space-y-2">
					<button
						onClick={() => {
							setActiveTab("customers");
							setSearchQuery("");
						}}
						className={`w-full text-left px-4 py-2 rounded-md font-medium transition ${activeTab === "customers" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
					>
						👥 Customers
					</button>
					<button
						onClick={() => {
							setActiveTab("employees");
							setSearchQuery("");
						}}
						className={`w-full text-left px-4 py-2 rounded-md font-medium transition ${activeTab === "employees" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
					>
						👨‍🍳 Staff
					</button>
					<button
						onClick={() => {
							setActiveTab("parcels");
							setSearchQuery("");
						}}
						className={`w-full text-left px-4 py-2 rounded-md font-medium transition ${activeTab === "parcels" ? "bg-orange-100 text-orange-700" : "text-gray-600 hover:bg-gray-100"}`}
					>
						🛵 Parcels
					</button>

					<Logout/>

				</nav>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 p-6 lg:p-8 overflow-y-auto">
				{/* Top Stats Cards */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
						<p className="text-sm font-medium text-gray-500">
							Total Customers
						</p>
						<p className="text-3xl font-bold text-gray-800">
							{stats.total}
						</p>
					</div>
					<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
						<p className="text-sm font-medium text-gray-500">
							Active Customers
						</p>
						<p className="text-3xl font-bold text-green-600">
							{stats.active}
						</p>
					</div>
					<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
						<p className="text-sm font-medium text-gray-500">
							Expiring Soon
						</p>
						<p className="text-3xl font-bold text-yellow-500">
							{stats.expiring}
						</p>
					</div>
					<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
						<p className="text-sm font-medium text-gray-500">
							Expired Memberships
						</p>
						<p className="text-3xl font-bold text-red-600">
							{stats.expired}
						</p>
					</div>
				</div>

				{/* Common Search Box */}
				<div className="mb-6 flex flex-col md:flex-row md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
					<div className="relative w-full md:w-1/2">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							🔍
						</div>
						<input
							type="text"
							placeholder="Search by Name, Phone or Role..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
						/>
					</div>
				</div>

				{/* ================= TAB: CUSTOMERS ================= */}
				{activeTab === "customers" && (
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
						{/* CUSTOMER HEADER & ADD BUTTON */}
						<div className="p-6 border-b flex justify-between items-center bg-gray-50">
							<h3 className="text-xl font-bold text-gray-800">
								Customer Management
							</h3>
							<button
								onClick={addCustomer}
								className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition shadow-sm"
							>
								+ Add Customer
							</button>
						</div>

						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="bg-gray-100 text-gray-600 text-sm border-b">
										<th className="p-4 font-bold">
											Name & Phone
										</th>
										<th className="p-4 font-bold">
											Plan & Type
										</th>
										<th className="p-4 font-bold">
											Days Left
										</th>
										<th className="p-4 font-bold">
											Payment
										</th>
										<th className="p-4 font-bold text-center">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredCustomers.length === 0 ? (
										<tr>
											<td
												colSpan="5"
												className="p-8 text-center text-gray-500"
											>
												Koi customer nahi mila. Naya add
												karein!
											</td>
										</tr>
									) : (
										filteredCustomers.map((c) => (
											<tr
												key={c.id}
												className="border-b hover:bg-gray-50 transition"
											>
												<td className="p-4 text-gray-800 font-medium">
													{c.name} <br />
													<span className="text-sm font-bold text-gray-600">
														{c.phone}
													</span>
												</td>
												<td className="p-4 text-gray-600">
													{c.plan} <br />
													<span className="text-xs font-bold text-gray-500">
														{c.deliveryType} •{" "}
														{c.mealsPerDay} Time
													</span>
												</td>
												<td className="p-4">
													<span
														className={`px-3 py-1 rounded-full text-xs font-bold ${c.daysLeft > 0 ? (c.daysLeft <= 3 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700") : "bg-red-100 text-red-700"}`}
													>
														{c.daysLeft} Days
													</span>
												</td>
												<td className="p-4">
													<span
														className={`text-sm font-bold ${c.paymentStatus === "Paid" ? "text-green-600" : "text-red-600"}`}
													>
														{c.paymentStatus}
													</span>
													{c.remainingAmount > 0 && (
														<span className="block text-xs mt-1 text-red-500 font-medium">
															Bal: ₹
															{c.remainingAmount}
														</span>
													)}
												</td>
												<td className="p-4">
													<div className="flex flex-col gap-2 w-24 mx-auto">
														<a
															href={`tel:${c.phone}`}
															className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-xs font-bold text-center hover:bg-green-200 transition"
														>
															📞 Call
														</a>
														<button
															onClick={() =>
																openEditModal(c)
															}
															className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-md text-xs font-bold text-center hover:bg-orange-200 transition"
														>
															✏️ Edit/Renew
														</button>
													</div>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* ================= TAB: EMPLOYEES ================= */}
				{activeTab === "employees" && (
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
						{/* EMPLOYEE HEADER & ADD BUTTON */}
						<div className="p-6 border-b flex justify-between items-center bg-gray-50">
							<h3 className="text-xl font-bold text-gray-800">
								Staff Management
							</h3>
							<button
								onClick={addEmployee}
								className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 transition shadow-sm"
							>
								+ Add Employee
							</button>
						</div>

						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="bg-gray-100 text-gray-600 text-sm border-b">
										<th className="p-4 font-bold">
											Employee Name
										</th>
										<th className="p-4 font-bold">Role</th>
										<th className="p-4 font-bold">
											Monthly Salary
										</th>
										<th className="p-4 font-bold text-center">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredEmployees.length === 0 ? (
										<tr>
											<td
												colSpan="4"
												className="p-8 text-center text-gray-500"
											>
												Abhi tak koi employee add nahi
												kiya gaya hai.
											</td>
										</tr>
									) : (
										filteredEmployees.map((emp) => (
											<tr
												key={emp.id}
												className="border-b hover:bg-gray-50 transition"
											>
												<td className="p-4 text-gray-800 font-bold">
													{emp.name}
												</td>
												<td className="p-4">
													<span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
														{emp.role}
													</span>
												</td>
												<td className="p-4 text-gray-800 font-medium">
													₹{emp.baseSalary}
												</td>
												<td className="p-4">
													<div className="flex justify-center">
														<button className="bg-orange-100 text-orange-700 px-4 py-2 rounded-md text-xs font-bold hover:bg-orange-200 transition">
															✏️ Edit Staff
														</button>
													</div>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* ================= TAB: PARCELS ================= */}
				{activeTab === "parcels" && (
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="p-6 border-b bg-gray-50">
							<h3 className="text-xl font-bold text-gray-800">
								Daily Parcel Deliveries
							</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="bg-gray-100 text-gray-600 text-sm border-b">
										<th className="p-4 font-bold">
											Customer Name
										</th>
										<th className="p-4 font-bold">
											Delivery Address
										</th>
										<th className="p-4 font-bold">
											Status
										</th>
										<th className="p-4 font-bold text-center">
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredParcels.length === 0 ? (
										<tr>
											<td
												colSpan="4"
												className="p-8 text-center text-gray-500"
											>
												Aaj ke liye koi parcel delivery
												nahi hai.
											</td>
										</tr>
									) : (
										filteredParcels.map((parcel) => (
											<tr
												key={parcel.id}
												className="border-b hover:bg-gray-50 transition"
											>
												<td className="p-4 text-gray-800 font-bold">
													{parcel.customer?.name}{" "}
													<br />
													<span className="text-sm font-bold text-gray-600">
														{parcel.customer?.phone}
													</span>
												</td>
												<td
													className="p-4 text-gray-600 text-sm max-w-[250px] truncate"
													title={
														parcel.customer?.address
													}
												>
													📍{" "}
													{parcel.customer?.address}
												</td>
												<td className="p-4">
													<span
														className={`px-3 py-1 rounded-full text-xs font-bold ${parcel.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}
													>
														{parcel.status}
													</span>
												</td>
												<td className="p-4">
													<div className="flex flex-col gap-2 w-28 mx-auto">
														<a
															href={`tel:${parcel.customer?.phone}`}
															className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-xs font-bold text-center hover:bg-blue-200 transition"
														>
															📞 Call
														</a>
														<button className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-xs font-bold text-center hover:bg-green-200 transition">
															✔️ Delivered
														</button>
													</div>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</main>

			{/* ================= EDIT & RENEW MODAL (PRE-FILLED) ================= */}
			{isEditModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 overflow-y-auto">
					<div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl w-full my-8 animate-fadeIn max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-6 border-b pb-4">
							<h3 className="text-2xl font-extrabold text-gray-800">
								Edit & Renew Customer
							</h3>
							<button
								onClick={() => setIsEditModalOpen(false)}
								className="text-gray-500 hover:text-red-500 font-bold text-xl"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleEditSubmit} className="space-y-6">
							{/* SECTION 1: EDIT DETAILS */}
							<div>
								<h4 className="text-lg font-bold text-orange-600 mb-3">
									1. Personal Details (Editable)
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Name
										</label>
										<input
											type="text"
											name="name"
											value={editFormData.name}
											onChange={handleEditChange}
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Phone
										</label>
										<input
											type="tel"
											name="phone"
											value={editFormData.phone}
											onChange={handleEditChange}
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-gray-700">
											Address
										</label>
										<textarea
											name="address"
											rows={2}
											value={editFormData.address}
											onChange={handleEditChange}
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Meals Per Day
										</label>
										<select
											name="mealsPerDay"
											value={editFormData.mealsPerDay}
											onChange={handleEditChange}
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
										>
											<option value={1}>
												1 Time Meal
											</option>
											<option value={2}>
												2 Time Meal
											</option>
											<option value={3}>
												3 Time Meal
											</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Delivery Type
										</label>
										<select
											name="deliveryType"
											value={editFormData.deliveryType}
											onChange={handleEditChange}
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
							</div>

							{/* SECTION 2: RENEWAL & PAYMENT */}
							<div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
								<h4 className="text-lg font-bold text-orange-800 mb-3">
									2. Add Renewal / Payment Log
								</h4>
								<p className="text-sm text-gray-600 mb-4">
									Purana Udhaar:{" "}
									<span className="font-bold text-red-600">
										₹{editFormData.existingRemaining}
									</span>
								</p>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Add New Days
										</label>
										<input
											type="number"
											name="addedDays"
											value={editFormData.addedDays}
											onChange={handleEditChange}
											placeholder="e.g. 30"
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm font-bold"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											New Bill Amount (₹)
										</label>
										<input
											type="number"
											name="billAmount"
											value={editFormData.billAmount}
											onChange={handleEditChange}
											placeholder="e.g. 1500"
											className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm font-bold"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Paid Today (₹)
										</label>
										<input
											type="number"
											name="paidAmount"
											value={editFormData.paidAmount}
											onChange={handleEditChange}
											placeholder="Jama Rashi"
											className="mt-1 block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm font-bold text-green-700"
										/>
									</div>
								</div>
							</div>

							<div className="flex justify-end space-x-4 pt-4 border-t">
								<button
									type="button"
									onClick={() => setIsEditModalOpen(false)}
									className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSaving}
									className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-md transition disabled:bg-orange-400"
								>
									{isSaving
										? "Saving..."
										: "Save Changes & Log History"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
