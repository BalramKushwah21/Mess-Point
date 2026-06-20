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
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="flex flex-col items-center gap-4">
					<div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
					<p className="text-orange-600 font-bold text-lg tracking-wide animate-pulse">
						Loading Workspace...
					</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-gray-900 selection:bg-orange-200 selection:text-orange-900">
			{/* Sidebar Navigation */}
			<aside className="w-full md:w-72 bg-white shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] border-r border-gray-100 flex-shrink-0 z-10">
				<div className="p-6 border-b border-gray-50 flex items-center justify-between md:block">
					<div>
						<h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
							Mess-Point
						</h2>
						<p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">
							Management Portal
						</p>
					</div>
				</div>

				{/* Mobile Scrollable Nav & Desktop Vertical Nav */}
				<nav className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
					<button
						onClick={() => {
							setActiveTab("customers");
							setSearchQuery("");
						}}
						className={`flex-shrink-0 md:w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 ${activeTab === "customers" ? "bg-orange-50 text-orange-700 shadow-[inset_0px_0px_0px_1px_rgba(234,88,12,0.15)]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
					>
						<span className="text-xl">👥</span>
						<span className="whitespace-nowrap">Customers</span>
					</button>
					<button
						onClick={() => {
							setActiveTab("employees");
							setSearchQuery("");
						}}
						className={`flex-shrink-0 md:w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 ${activeTab === "employees" ? "bg-orange-50 text-orange-700 shadow-[inset_0px_0px_0px_1px_rgba(234,88,12,0.15)]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
					>
						<span className="text-xl">👨‍🍳</span>
						<span className="whitespace-nowrap">Staff Members</span>
					</button>
					<button
						onClick={() => {
							setActiveTab("parcels");
							setSearchQuery("");
						}}
						className={`flex-shrink-0 md:w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 ${activeTab === "parcels" ? "bg-orange-50 text-orange-700 shadow-[inset_0px_0px_0px_1px_rgba(234,88,12,0.15)]" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
					>
						<span className="text-xl">🛵</span>
						<span className="whitespace-nowrap">Deliveries</span>
					</button>

					<div className="md:mt-auto pt-4 md:border-t border-gray-100 flex-shrink-0">
						<Logout />
					</div>
				</nav>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
				{/* Top Stats Cards */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
					<div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
						<div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
						<p className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-wide relative z-10">
							Total Customers
						</p>
						<p className="text-3xl sm:text-4xl font-black text-gray-800 mt-2 relative z-10">
							{stats.total}
						</p>
					</div>
					<div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-emerald-100 hover:shadow-md transition-shadow relative overflow-hidden group">
						<div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
						<p className="text-xs sm:text-sm font-bold text-emerald-600 uppercase tracking-wide relative z-10">
							Active
						</p>
						<p className="text-3xl sm:text-4xl font-black text-emerald-600 mt-2 relative z-10">
							{stats.active}
						</p>
					</div>
					<div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-amber-100 hover:shadow-md transition-shadow relative overflow-hidden group">
						<div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
						<p className="text-xs sm:text-sm font-bold text-amber-600 uppercase tracking-wide relative z-10">
							Expiring Soon
						</p>
						<p className="text-3xl sm:text-4xl font-black text-amber-500 mt-2 relative z-10">
							{stats.expiring}
						</p>
					</div>
					<div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow relative overflow-hidden group">
						<div className="absolute -right-4 -top-4 w-16 h-16 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
						<p className="text-xs sm:text-sm font-bold text-rose-600 uppercase tracking-wide relative z-10">
							Expired
						</p>
						<p className="text-3xl sm:text-4xl font-black text-rose-600 mt-2 relative z-10">
							{stats.expired}
						</p>
					</div>
				</div>

				{/* Common Search Box */}
				<div className="mb-8 relative max-w-2xl group">
					<div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-xl transition-transform group-focus-within:scale-110">
						🔍
					</div>
					<input
						type="text"
						placeholder="Search by Name, Phone or Role..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-12 pr-6 py-4 w-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-gray-700"
					/>
				</div>

				{/* ================= TAB: CUSTOMERS ================= */}
				{activeTab === "customers" && (
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
							<h3 className="text-xl font-extrabold text-gray-800">
								Customer Database
							</h3>
							<button
								onClick={addCustomer}
								className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
							>
								+ New Customer
							</button>
						</div>

						<div className="overflow-x-auto w-full">
							<table className="w-full text-left border-collapse whitespace-nowrap">
								<thead>
									<tr className="bg-gray-50/50 text-gray-500 text-xs tracking-wider uppercase border-b border-gray-100">
										<th className="p-5 font-bold">
											Profile
										</th>
										<th className="p-5 font-bold">
											Subscription
										</th>
										<th className="p-5 font-bold">
											Status
										</th>
										<th className="p-5 font-bold">
											Accounts
										</th>
										<th className="p-5 font-bold text-center">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{filteredCustomers.length === 0 ? (
										<tr>
											<td
												colSpan="5"
												className="p-12 text-center"
											>
												<div className="text-4xl mb-3">
													📭
												</div>
												<p className="text-gray-500 font-medium">
													Koi customer nahi mila.
												</p>
											</td>
										</tr>
									) : (
										filteredCustomers.map((c) => (
											<tr
												key={c.id}
												className="hover:bg-gray-50/80 transition-colors group"
											>
												<td className="p-5">
													<div className="flex flex-col">
														<span className="text-gray-900 font-bold">
															{c.name}
														</span>
														<span className="text-sm font-semibold text-gray-500 mt-0.5">
															{c.phone}
														</span>
													</div>
												</td>
												<td className="p-5">
													<div className="flex flex-col">
														<span className="text-gray-700 font-semibold">
															{c.plan}
														</span>
														<span className="text-xs font-bold text-gray-400 mt-0.5">
															{c.deliveryType} •{" "}
															{c.mealsPerDay} Time
														</span>
													</div>
												</td>
												<td className="p-5">
													<span
														className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide border ${c.daysLeft > 0 ? (c.daysLeft <= 3 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200") : "bg-rose-50 text-rose-700 border-rose-200"}`}
													>
														{c.daysLeft} Days Left
													</span>
												</td>
												<td className="p-5">
													<div className="flex flex-col items-start gap-1">
														<span
															className={`text-sm font-bold flex items-center gap-1 ${c.paymentStatus === "Paid" ? "text-emerald-600" : "text-rose-600"}`}
														>
															{c.paymentStatus ===
															"Paid"
																? "✓"
																: "!"}{" "}
															{c.paymentStatus}
														</span>
														{c.remainingAmount >
															0 && (
															<span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-md border border-rose-100">
																<p className="text-green-500">
																	Paid: ₹
																	{
																		c.paidAmount
																	}
																</p>
																Due: ₹
																{
																	c.remainingAmount
																}
															</span>
														)}
													</div>
												</td>
												<td className="p-5">
													<div className="flex items-center justify-center gap-2">
														<a
															href={`tel:${c.phone}`}
															className="p-2.5 bg-gray-100 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
															title="Call"
														>
															📞
														</a>
														<button
															onClick={() =>
																openEditModal(c)
															}
															className="px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl text-sm font-bold transition-colors"
														>
															Edit / Renew
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
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
							<h3 className="text-xl font-extrabold text-gray-800">
								Staff Directory
							</h3>
							<button
								onClick={addEmployee}
								className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
							>
								+ Add Staff
							</button>
						</div>

						<div className="overflow-x-auto w-full">
							<table className="w-full text-left border-collapse whitespace-nowrap">
								<thead>
									<tr className="bg-gray-50/50 text-gray-500 text-xs tracking-wider uppercase border-b border-gray-100">
										<th className="p-5 font-bold">
											Staff Member
										</th>
										<th className="p-5 font-bold">
											Designation
										</th>
										<th className="p-5 font-bold">
											Base Salary
										</th>
										<th className="p-5 font-bold text-center">
											Manage
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{filteredEmployees.length === 0 ? (
										<tr>
											<td
												colSpan="4"
												className="p-12 text-center"
											>
												<div className="text-4xl mb-3">
													👨‍🍳
												</div>
												<p className="text-gray-500 font-medium">
													Abhi tak koi staff add nahi
													kiya gaya hai.
												</p>
											</td>
										</tr>
									) : (
										filteredEmployees.map((emp) => (
											<tr
												key={emp.id}
												className="hover:bg-gray-50/80 transition-colors group"
											>
												<td className="p-5 text-gray-900 font-extrabold">
													{emp.name}
												</td>
												<td className="p-5">
													<span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide">
														{emp.role}
													</span>
												</td>
												<td className="p-5 text-gray-700 font-bold">
													₹{emp.baseSalary}
												</td>
												<td className="p-5">
													<div className="flex justify-center">
														<button className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50 rounded-xl text-sm font-bold transition-all">
															Configure
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
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
						<div className="p-5 sm:p-6 border-b border-gray-100 bg-white">
							<h3 className="text-xl font-extrabold text-gray-800">
								Active Deliveries
							</h3>
						</div>
						<div className="overflow-x-auto w-full">
							<table className="w-full text-left border-collapse whitespace-nowrap">
								<thead>
									<tr className="bg-gray-50/50 text-gray-500 text-xs tracking-wider uppercase border-b border-gray-100">
										<th className="p-5 font-bold">
											Recipient
										</th>
										<th className="p-5 font-bold">
											Location
										</th>
										<th className="p-5 font-bold">
											Status
										</th>
										<th className="p-5 font-bold text-center">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-50">
									{filteredParcels.length === 0 ? (
										<tr>
											<td
												colSpan="4"
												className="p-12 text-center"
											>
												<div className="text-4xl mb-3">
													🛵
												</div>
												<p className="text-gray-500 font-medium">
													Aaj ke liye koi parcel
													pending nahi hai.
												</p>
											</td>
										</tr>
									) : (
										filteredParcels.map((parcel) => (
											<tr
												key={parcel.id}
												className="hover:bg-gray-50/80 transition-colors group"
											>
												<td className="p-5">
													<div className="flex flex-col">
														<span className="text-gray-900 font-bold">
															{
																parcel.customer
																	?.name
															}
														</span>
														<span className="text-sm font-semibold text-gray-500 mt-0.5">
															{
																parcel.customer
																	?.phone
															}
														</span>
													</div>
												</td>
												<td
													className="p-5 max-w-[200px] truncate text-gray-600 font-medium"
													title={
														parcel.customer?.address
													}
												>
													<span className="text-orange-500 mr-1">
														📍
													</span>
													{parcel.customer?.address}
												</td>
												<td className="p-5">
													<span
														className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide border ${parcel.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
													>
														{parcel.status}
													</span>
												</td>
												<td className="p-5">
													<div className="flex items-center justify-center gap-2">
														<a
															href={`tel:${parcel.customer?.phone}`}
															className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
															title="Call Customer"
														>
															📞
														</a>
														<button className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 rounded-xl text-sm font-bold transition-all">
															Mark Done
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

			{/* ================= EDIT & RENEW MODAL ================= */}
			{isEditModalOpen && (
				<div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto transition-opacity">
					<div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full my-8 transform transition-all scale-100">
						<div className="flex justify-between items-center mb-6">
							<div>
								<h3 className="text-2xl font-black text-gray-900">
									Update Customer
								</h3>
								<p className="text-sm text-gray-500 font-medium mt-1">
									Modify details or add a new payment log.
								</p>
							</div>
							<button
								onClick={() => setIsEditModalOpen(false)}
								className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
							>
								✕
							</button>
						</div>

						<form onSubmit={handleEditSubmit} className="space-y-8">
							{/* SECTION 1: EDIT DETAILS */}
							<div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
								<h4 className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-4">
									Personal Details
								</h4>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
									<div>
										<label className="block text-sm font-bold text-gray-700 mb-1.5">
											Name
										</label>
										<input
											type="text"
											name="name"
											value={editFormData.name}
											onChange={handleEditChange}
											className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-gray-800 font-medium shadow-sm"
										/>
									</div>
									<div>
										<label className="block text-sm font-bold text-gray-700 mb-1.5">
											Phone
										</label>
										<input
											type="tel"
											name="phone"
											value={editFormData.phone}
											onChange={handleEditChange}
											className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-gray-800 font-medium shadow-sm"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-bold text-gray-700 mb-1.5">
											Address
										</label>
										<textarea
											name="address"
											rows={2}
											value={editFormData.address}
											onChange={handleEditChange}
											className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-gray-800 font-medium shadow-sm resize-none"
										/>
									</div>
									<div>
										<label className="block text-sm font-bold text-gray-700 mb-1.5">
											Meals Per Day
										</label>
										<select
											name="mealsPerDay"
											value={editFormData.mealsPerDay}
											onChange={handleEditChange}
											className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-gray-800 font-medium shadow-sm appearance-none"
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
										<label className="block text-sm font-bold text-gray-700 mb-1.5">
											Delivery Type
										</label>
										<select
											name="deliveryType"
											value={editFormData.deliveryType}
											onChange={handleEditChange}
											className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all text-gray-800 font-medium shadow-sm appearance-none"
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
							<div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100 shadow-inner">
								<div className="flex justify-between items-end mb-5">
									<h4 className="text-sm font-bold text-orange-800 tracking-wider uppercase">
										Renewal & Payment
									</h4>
									<div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-orange-100">
										<span className="text-xs font-bold text-gray-500 uppercase">
											Previous Due:{" "}
										</span>
										<span className="font-black text-rose-600 text-lg ml-1">
											₹{editFormData.existingRemaining}
										</span>
									</div>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
									<div>
										<label className="block text-xs font-bold text-orange-900 mb-1.5">
											Add Days
										</label>
										<input
											type="number"
											name="addedDays"
											value={editFormData.addedDays}
											onChange={handleEditChange}
											placeholder="e.g. 30"
											className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-gray-900 font-black text-lg shadow-sm"
										/>
									</div>
									<div>
										<label className="block text-xs font-bold text-orange-900 mb-1.5">
											New Bill (₹)
										</label>
										<input
											type="number"
											name="billAmount"
											value={editFormData.billAmount}
											onChange={handleEditChange}
											placeholder="e.g. 1500"
											className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-gray-900 font-black text-lg shadow-sm"
										/>
									</div>
									<div>
										<label className="block text-xs font-bold text-emerald-900 mb-1.5">
											Paid Today (₹)
										</label>
										<input
											type="number"
											name="paidAmount"
											value={editFormData.paidAmount}
											onChange={handleEditChange}
											placeholder="Jama Rashi"
											className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-emerald-700 font-black text-lg shadow-sm"
										/>
									</div>
								</div>
							</div>

							<div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
								<button
									type="button"
									onClick={() => setIsEditModalOpen(false)}
									className="w-full sm:w-auto px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSaving}
									className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
								>
									{isSaving
										? "Saving Data..."
										: "Save & Log History"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
