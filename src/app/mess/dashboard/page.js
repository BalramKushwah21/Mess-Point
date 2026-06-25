"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logout from "@/components/logout";

// Import new modular components
import CustomersTab from "@/components/dashboard/CustomersTab";
import EmployeesTab from "@/components/dashboard/EmployeesTab";
import ParcelsTab from "@/components/dashboard/ParcelsTab";

export default function Dashboard() {
	const router = useRouter();

	const [activeTab, setActiveTab] = useState("customers");
	const [searchQuery, setSearchQuery] = useState("");

	const [stats, setStats] = useState({
		total: 0,
		active: 0,
		expiring: 0,
		expired: 0,
	});
	const [customers, setCustomers] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [parcels, setParcels] = useState([]);
	const [messName, setMessName] = useState("Loading...");
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		setIsLoading(true);
		try {
			const res = await fetch("/api/dashboard");
			if (res.ok) {
				const data = await res.json();
				setStats(
					data.stats || {
						total: 0,
						active: 0,
						expiring: 0,
						expired: 0,
					},
				);
				setCustomers(data.customers || []);
				setEmployees(data.employees || []);
				setParcels(data.parcels || []);
				setMessName(data.messName || "Mess-Point");
			}
		} catch (error) {
			console.error("Error fetching dashboard data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
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
	}

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-gray-900 selection:bg-orange-200 selection:text-orange-900">
			{/* Sidebar Navigation */}
			<aside className="w-full md:w-72 bg-white shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] border-r border-gray-100 flex-shrink-0 z-10">
				<div className="p-6 border-b border-gray-50 flex items-center justify-between md:block">
					<div>
						<h2
							className="text-3xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent drop-shadow-sm truncate"
							title={messName}
						>
							{messName}
						</h2>
						<p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">
							Management Portal
						</p>
					</div>
				</div>

				<nav className="p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
					{["customers", "employees", "parcels"].map((tab) => (
						<button
							key={tab}
							onClick={() => {
								setActiveTab(tab);
								setSearchQuery("");
							}}
							className={`flex-shrink-0 md:w-full text-left px-5 py-3.5 rounded-xl font-bold transition-all duration-200 flex items-center gap-3 ${
								activeTab === tab
									? "bg-orange-50 text-orange-700 shadow-[inset_0px_0px_0px_1px_rgba(234,88,12,0.15)]"
									: "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
							}`}
						>
							<span className="text-xl">
								{tab === "customers"
									? "👥"
									: tab === "employees"
										? "👨‍🍳"
										: "🛵"}
							</span>
							<span className="whitespace-nowrap capitalize">
								{tab === "employees"
									? "Staff Members"
									: tab === "parcels"
										? "Deliveries"
										: tab}
							</span>
						</button>
					))}
					<div className="md:mt-auto pt-4 md:border-t border-gray-100 flex-shrink-0"></div>
					<Logout />
				</nav>
			</aside>

			{/* Main Content Area */}
			<main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
				{/* DYNAMIC TOP STATS CARDS */}
				{activeTab === "customers" && (
					<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 animate-fade-in">
						<StatCard
							title="Total Customers"
							value={stats.total}
							color="gray"
						/>
						<StatCard
							title="Active"
							value={stats.active}
							color="emerald"
						/>
						<StatCard
							title="Expiring Soon"
							value={stats.expiring}
							color="amber"
						/>
						<StatCard
							title="Expired"
							value={stats.expired}
							color="rose"
						/>
					</div>
				)}

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

				{/* RENDER ACTIVE COMPONENT */}
				{activeTab === "customers" && (
					<CustomersTab
						customers={customers}
						searchQuery={searchQuery}
						refreshData={fetchDashboardData}
						messName={messName}
					/>
				)}
				{activeTab === "employees" && (
					<EmployeesTab
						employees={employees}
						searchQuery={searchQuery}
						refreshData={fetchDashboardData}
					/>
				)}
				{activeTab === "parcels" && (
					<ParcelsTab
						parcels={parcels}
						searchQuery={searchQuery}
						refreshData={fetchDashboardData}
					/>
				)}
			</main>
		</div>
	);
}

// Reusable Sub-component for Stats
function StatCard({ title, value, color }) {
	const colorClasses = {
		gray: "border-gray-100 text-gray-800",
		emerald: "border-emerald-100 text-emerald-600",
		amber: "border-amber-100 text-amber-500",
		rose: "border-rose-100 text-rose-600",
	};
	return (
		<div
			className={`bg-white p-5 sm:p-6 rounded-2xl shadow-sm border ${colorClasses[color]} relative overflow-hidden`}
		>
			<p
				className={`text-xs sm:text-sm font-bold uppercase tracking-wide opacity-80`}
			>
				{title}
			</p>
			<p className={`text-3xl sm:text-4xl font-black mt-2`}>{value}</p>
		</div>
	);
}
