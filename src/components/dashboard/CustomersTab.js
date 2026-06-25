import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomersTab({
	customers,
	searchQuery,
	refreshData,
	messName,
}) {
	const router = useRouter();
	const [customerFilter, setCustomerFilter] = useState("all");

	// UI States
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editFormData, setEditFormData] = useState({});
	const [isSaving, setIsSaving] = useState(false);

	const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
	const [historyData, setHistoryData] = useState([]);
	const [isHistoryLoading, setIsHistoryLoading] = useState(false);
	const [selectedCustomerName, setSelectedCustomerName] = useState("");

	const addCustomer = () => router.push("/mess/add-customer");

	const filteredCustomers = customers.filter((c) => {
		const matchesSearch =
			(c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(c.phone || "").includes(searchQuery);
		if (!matchesSearch) return false;

		if (customerFilter === "expiring")
			return c.daysLeft > 0 && c.daysLeft <= 3;
		if (customerFilter === "expired") return c.daysLeft <= 0;
		if (customerFilter === "due") return c.remainingAmount > 0;
		return true;
	});

	const sendWhatsAppMessage = (customer) => {
		let message =
			customer.daysLeft > 0
				? `Namaste ${customer.name},\nAapki Mess service ke *${customer.daysLeft} din* baaki hain.`
				: `Namaste ${customer.name},\n⚠️ Aapki Mess service *expire* ho chuki hai. Kripya apni service continue rakhne ke liye renew karein.`;

		if (customer.remainingAmount > 0)
			message += `\n\nSath hi, aapka pichla due amount: *₹${customer.remainingAmount}* hai.`;
		message += `\n\nDhanyawad,\n*${messName}*`;

		let phoneNum = customer.phone.replace(/\D/g, "");
		if (phoneNum.length === 10) phoneNum = "91" + phoneNum;
		window.open(
			`https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`,
			"_blank",
		);
	};

	// Helper function to format date for <input type="date"> (YYYY-MM-DD)
	const formatDateForInput = (dateString) => {
		if (!dateString) return "";
		const d = new Date(dateString);
		if (isNaN(d.getTime())) return "";
		return d.toISOString().split("T")[0];
	};

	const openEditModal = (customer) => {
		const baseDays = parseInt(customer.daysLeft) || 0;
		setEditFormData({
			id: customer.id,
			name: customer.name,
			phone: customer.phone,
			address: customer.address,
			plan: customer.plan,
			mealsPerDay: customer.mealsPerDay,
			deliveryType: customer.deliveryType,

			// Format dates so they show up in the input fields correctly
			startDate: formatDateForInput(customer.startDate),
			paymentDate: formatDateForInput(customer.paymentDate),

			daysLeft: baseDays,
			originalDaysLeft: baseDays,
			addedDays: "",
			billAmount: "",
			paidAmount: "",
			paymentStatus: "Paid",
			existingRemaining: customer.remainingAmount || 0,
		});
		setIsEditModalOpen(true);
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		setEditFormData((prev) => {
			const updated = { ...prev, [name]: value };

			if (name === "addedDays") {
				const baseDays = parseInt(prev.originalDaysLeft) || 0;
				const newDays = parseInt(value) || 0;
				updated.daysLeft = baseDays + newDays;
			}

			if (name === "billAmount" || name === "paidAmount") {
				const bill =
					name === "billAmount"
						? parseInt(value) || 0
						: parseInt(prev.billAmount) || 0;
				const paid =
					name === "paidAmount"
						? parseInt(value) || 0
						: parseInt(prev.paidAmount) || 0;

				if (paid >= bill && bill > 0) updated.paymentStatus = "Paid";
				else if (paid === 0 && bill > 0)
					updated.paymentStatus = "Pending";
				else updated.paymentStatus = "Partial";
			}
			return updated;
		});
	};

	const handleEditSubmit = async (e) => {
		e.preventDefault();
		setIsSaving(true);
		const payload = {
			...editFormData,
			addedDays: parseInt(editFormData.addedDays) || 0,
			billAmount: parseInt(editFormData.billAmount) || 0,
			paidAmount: parseInt(editFormData.paidAmount) || 0,
			// Dates are already in editFormData string format (YYYY-MM-DD), so they will go directly to backend
		};

		try {
			const response = await fetch("/api/customers/renew", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (response.ok) {
				alert("Customer updated successfully!");
				setIsEditModalOpen(false);
				refreshData();
			} else alert("Error saving data.");
		} catch (error) {
			alert("System error!");
		} finally {
			setIsSaving(false);
		}
	};

	const openHistoryModal = async (customer) => {
		setSelectedCustomerName(customer.name);
		setIsHistoryModalOpen(true);
		setIsHistoryLoading(true);
		try {
			const res = await fetch(`/api/customers/${customer.id}/history`);
			if (res.ok) {
				const data = await res.json();
				setHistoryData(data.history || []);
			} else setHistoryData([]);
		} catch (error) {
			console.error("Error fetching history:", error);
		} finally {
			setIsHistoryLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
			{/* Header & Filters */}
			<div className="p-5 sm:p-6 border-b border-gray-100 bg-white">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
					<h3 className="text-xl font-extrabold text-gray-800">
						Customer Database
					</h3>
					<button
						onClick={addCustomer}
						className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.23)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all"
					>
						+ New Customer
					</button>
				</div>
				<div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
					<FilterButton
						active={customerFilter === "all"}
						onClick={() => setCustomerFilter("all")}
						text="All"
						colors="bg-gray-800 text-white"
					/>
					<FilterButton
						active={customerFilter === "expiring"}
						onClick={() => setCustomerFilter("expiring")}
						text="⏳ Expiring Soon"
						colors="bg-amber-500 text-white"
						idle="bg-amber-50 text-amber-700 hover:bg-amber-100"
					/>
					<FilterButton
						active={customerFilter === "expired"}
						onClick={() => setCustomerFilter("expired")}
						text="🛑 Expired"
						colors="bg-rose-500 text-white"
						idle="bg-rose-50 text-rose-700 hover:bg-rose-100"
					/>
					<FilterButton
						active={customerFilter === "due"}
						onClick={() => setCustomerFilter("due")}
						text="💰 Due Amount"
						colors="bg-blue-500 text-white"
						idle="bg-blue-50 text-blue-700 hover:bg-blue-100"
					/>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto w-full">
				<table className="w-full text-left border-collapse whitespace-nowrap">
					<thead>
						<tr className="bg-gray-50/50 text-gray-500 text-xs tracking-wider uppercase border-b border-gray-100">
							<th className="p-5 font-bold">Profile</th>
							<th className="p-5 font-bold">Subscription</th>
							<th className="p-5 font-bold">Status</th>
							<th className="p-5 font-bold">Accounts</th>
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
									className="p-12 text-center text-gray-500 font-medium"
								>
									<span className="text-4xl mb-3 block">
										📭
									</span>{" "}
									Koi customer nahi mila.
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
												{c.paymentStatus === "Paid"
													? "✓"
													: "!"}{" "}
												{c.paymentStatus}
											</span>
											{c.remainingAmount > 0 && (
												<span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-xs font-bold rounded-md border border-rose-100">
													<span className="text-green-500">
														Paid: ₹{c.paidAmount}
													</span>
													<br /> Due: ₹
													{c.remainingAmount}
												</span>
											)}
										</div>
									</td>
									<td className="p-5">
										<div className="flex items-center justify-center gap-2">
											<button
												onClick={() =>
													openHistoryModal(c)
												}
												className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 rounded-xl transition-colors"
												title="View History"
											>
												📜
											</button>
											<a
												href={`tel:${c.phone}`}
												className="p-2.5 bg-gray-100 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
												title="Call"
											>
												📞
											</a>
											<button
												onClick={() =>
													sendWhatsAppMessage(c)
												}
												className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-xl transition-colors"
												title="WhatsApp Reminder"
											>
												💬
											</button>
											<button
												onClick={() => openEditModal(c)}
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

			{/* ================= EDIT & RENEW MODAL ================= */}
			{isEditModalOpen && (
				<div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50">
					<div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto no-scrollbar transform transition-all scale-100">
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
							{/* Personal Details */}
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

							{/* Service Details - NOW EDITABLE */}
							<div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
								<h4 className="text-sm font-bold text-blue-500 tracking-wider uppercase mb-4">
									Service Details
								</h4>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
									<div>
										<label className="block text-xs font-bold text-blue-900 mb-1.5">
											Mess Start Date
										</label>
										<input
											type="date"
											name="startDate"
											value={editFormData.startDate}
											onChange={handleEditChange}
											className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-blue-800 font-semibold text-sm shadow-sm"
										/>
									</div>
									<div>
										<label className="block text-xs font-bold text-blue-900 mb-1.5">
											Last Payment Date
										</label>
										<input
											type="date"
											name="paymentDate"
											value={editFormData.paymentDate}
											onChange={handleEditChange}
											className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-blue-800 font-semibold text-sm shadow-sm"
										/>
									</div>
									<div>
										<label className="block text-xs font-bold text-blue-900 mb-1.5">
											Total Days Left
										</label>
										<div className="px-4 py-3 bg-blue-600 border border-blue-700 rounded-xl text-white font-black text-lg shadow-sm transition-all text-center">
											{editFormData.daysLeft} Days
										</div>
									</div>
								</div>
							</div>

							{/* Renewal & Payment */}
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
											placeholder="Paid (₹)"
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

			{/* ================= HISTORY MODAL ================= */}
			{isHistoryModalOpen && (
				<div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-50">
					<div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-3xl w-full max-h-[95vh] overflow-y-auto no-scrollbar transform transition-all scale-100">
						<div className="flex justify-between items-center mb-6">
							<div>
								<h3 className="text-2xl font-black text-gray-900">
									Payment & Renewal History
								</h3>
								<p className="text-sm text-gray-500 font-medium mt-1">
									Customer:{" "}
									<span className="text-indigo-600 font-bold">
										{selectedCustomerName}
									</span>
								</p>
							</div>
							<button
								onClick={() => setIsHistoryModalOpen(false)}
								className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-colors"
							>
								✕
							</button>
						</div>

						{isHistoryLoading ? (
							<div className="py-12 flex justify-center items-center">
								<div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
							</div>
						) : historyData.length === 0 ? (
							<div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
								<span className="text-4xl mb-3 block">📭</span>
								<p className="text-gray-500 font-medium">
									No history records found for this customer.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto rounded-2xl border border-gray-100">
								<table className="w-full text-left border-collapse whitespace-nowrap">
									<thead>
										<tr className="bg-gray-50 text-gray-500 text-xs tracking-wider uppercase border-b border-gray-100">
											<th className="p-4 font-bold">
												Date
											</th>
											<th className="p-4 font-bold">
												Added Days
											</th>
											<th className="p-4 font-bold">
												Bill Amount
											</th>
											<th className="p-4 font-bold">
												Paid
											</th>
											<th className="p-4 font-bold">
												Status
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-50">
										{historyData.map((record) => (
											<tr
												key={record.id}
												className="hover:bg-gray-50/80 transition-colors"
											>
												<td className="p-4 text-sm font-semibold text-gray-800">
													{new Date(
														record.transactionDate,
													).toLocaleDateString(
														"en-IN",
													)}
												</td>
												<td className="p-4 text-sm font-bold text-indigo-600">
													+{record.addedDays} Days
												</td>
												<td className="p-4 text-sm text-gray-600 font-medium">
													₹{record.billAmount}
												</td>
												<td className="p-4 text-sm text-emerald-600 font-bold">
													₹{record.paidAmount}
												</td>
												<td className="p-4">
													<span
														className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${record.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}
													>
														{record.paymentStatus}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
						<div className="mt-6 flex justify-end">
							<button
								onClick={() => setIsHistoryModalOpen(false)}
								className="px-6 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// Helper for filter buttons
function FilterButton({
	active,
	onClick,
	text,
	colors,
	idle = "bg-gray-100 text-gray-600 hover:bg-gray-200",
}) {
	return (
		<button
			onClick={onClick}
			className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${active ? colors : idle}`}
		>
			{text}
		</button>
	);
}
