import { useState } from "react";

export default function ParcelsTab({ parcels, searchQuery, refreshData }) {
	const [isGenerating, setIsGenerating] = useState(false);

	const filteredParcels = parcels.filter(
		(p) =>
			(p.customer?.name || "")
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			(p.customer?.phone || "").includes(searchQuery),
	);

	const handleGenerateParcels = async () => {
		setIsGenerating(true);
		try {
			const res = await fetch("/api/parcels/generate", {
				method: "POST",
			});
			const data = await res.json();
			if (res.ok) {
				alert("Aaj ki Deliveries Generate ho gayi hain!");
				refreshData();
			} else alert(data.error || "Generation Failed");
		} catch (error) {
			alert("System Error!");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleMarkDone = async (parcelId) => {
		try {
			const res = await fetch("/api/parcels/mark-done", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ parcelId }),
			});
			if (res.ok) refreshData();
			else alert("Failed to mark done");
		} catch (error) {
			alert("System Error!");
		}
	};

	return (
		<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
			<div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex justify-between items-center">
				<h3 className="text-xl font-extrabold text-gray-800">
					Today's Deliveries
				</h3>
				<button
					onClick={handleGenerateParcels}
					disabled={isGenerating}
					className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
				>
					{isGenerating ? "Generating..." : "📦 Generate Parcels"}
				</button>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse whitespace-nowrap">
					<thead>
						<tr className="bg-gray-50/50 text-gray-500 text-xs tracking-wider uppercase border-b border-gray-100">
							<th className="p-5 font-bold">Customer</th>
							<th className="p-5 font-bold">Address</th>
							<th className="p-5 font-bold">Status</th>
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
									className="p-12 text-center text-gray-500 font-medium"
								>
									<span className="text-4xl mb-3 block">
										🛵
									</span>{" "}
									No deliveries today.
								</td>
							</tr>
						) : (
							filteredParcels.map((p) => (
								<tr key={p.id} className="hover:bg-gray-50/80">
									<td className="p-5 font-bold text-gray-900">
										{p.customer?.name}
									</td>
									<td className="p-5 text-gray-600 text-sm truncate max-w-[200px]">
										{p.customer?.address}
									</td>
									<td className="p-5">
										<span
											className={`px-2 py-1 rounded text-xs font-bold ${p.status === "Delivered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}
										>
											{p.status || "Pending"}
										</span>
									</td>
									<td className="p-5 text-center">
										{p.status !== "Delivered" && (
											<button
												onClick={() =>
													handleMarkDone(p.id)
												}
												className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-bold"
											>
												Mark Done ✓
											</button>
										)}
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
