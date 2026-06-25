import { useRouter } from "next/navigation";

export default function EmployeesTab({ employees, searchQuery }) {
	const router = useRouter();

	const addEmployee = () => router.push("/mess/add-employee");

	const filteredEmployees = employees.filter(
		(emp) =>
			(emp.name || "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			(emp.role || "").toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const totalSalaryExpense = employees.reduce(
		(acc, emp) => acc + (emp.baseSalary || 0),
		0,
	);

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			<div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex justify-between items-center">
				<div>
					<h3 className="text-xl font-extrabold text-gray-800">
						Staff Members
					</h3>
					<p className="text-sm text-gray-500 font-medium">
						Total Salary Expense:{" "}
						<span className="text-rose-600 font-bold">
							₹{totalSalaryExpense}
						</span>
					</p>
				</div>
				<button
					onClick={addEmployee}
					className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:-translate-y-0.5 transition-all"
				>
					+ Add Staff
				</button>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse whitespace-nowrap">
					<thead>
						<tr className="bg-gray-50/50 text-gray-500 text-xs tracking-wider uppercase border-b border-gray-100">
							<th className="p-5 font-bold">Staff Name</th>
							<th className="p-5 font-bold">Role</th>
							<th className="p-5 font-bold">Base Salary</th>
							<th className="p-5 font-bold text-center">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredEmployees.length === 0 ? (
							<tr>
								<td
									colSpan="4"
									className="p-12 text-center text-gray-500 font-medium"
								>
									<span className="text-4xl mb-3 block">
										👨‍🍳
									</span>{" "}
									No staff found.
								</td>
							</tr>
						) : (
							filteredEmployees.map((emp) => (
								<tr
									key={emp.id}
									className="hover:bg-gray-50/80"
								>
									<td className="p-5 font-bold text-gray-900">
										{emp.name} <br />
										<span className="text-xs text-gray-500">
											{emp.phone}
										</span>
									</td>
									<td className="p-5 text-gray-700 font-semibold">
										{emp.role}
									</td>
									<td className="p-5 text-gray-700 font-semibold">
										₹{emp.baseSalary}
									</td>
									<td className="p-5 text-center">
										<button className="px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-xl text-sm font-bold">
											Manage
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
