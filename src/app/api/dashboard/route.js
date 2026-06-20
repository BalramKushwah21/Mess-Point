import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user || !session.user.messId) {
			return NextResponse.json(
				{ error: "Unauthorized access. Please log in." },
				{ status: 401 },
			);
		}

		const messId = parseInt(session.user.messId);

		// 1. Fetch Mess Name
		const messDetails = await prisma.mess.findUnique({
			where: { id: messId },
			select: { messName: true },
		});

		// 2. Fetch Customers
		const customers = await prisma.customer.findMany({
			where: { messId: messId },
			orderBy: { id: "desc" },
		});

		// 3. Fetch Employees
		const employees = await prisma.employee.findMany({
			where: { messId: messId },
			orderBy: { name: "asc" },
		});

		// 4. NAYA CODE: Fetch Active Parcels from Database
		const parcels = await prisma.parcel.findMany({
			where: {
				messId: messId,
				status: "Pending", // Sirf aaj ki pending deliveries
			},
			include: {
				customer: {
					select: { name: true, phone: true, address: true },
				},
			},
		});

		// 5. Stats Calculate
		const total = customers.length;
		const active = customers.filter((c) => c.daysLeft > 3).length;
		const expiring = customers.filter(
			(c) => c.daysLeft > 0 && c.daysLeft <= 3,
		).length;
		const expired = customers.filter((c) => c.daysLeft <= 0).length;

		return NextResponse.json(
			{
				messName: messDetails?.messName || "Mess-Point",
				stats: { total, active, expiring, expired },
				customers,
				employees,
				parcels, // API ab parcels return karegi
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Dashboard Fetch Error:", error);
		return NextResponse.json(
			{ error: "Data fetch karne mein problem aayi." },
			{ status: 500 },
		);
	}
}
