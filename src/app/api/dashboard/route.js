import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
	try {
		// 1. Session se logged-in owner ka messId nikalna
		const session = await getServerSession(authOptions);

		if (!session || !session.user || !session.user.messId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const messId = parseInt(session.user.messId);

		// 2. Database se is mess ka saara data fetch karna
		const customers = await prisma.customer.findMany({
			where: { messId: messId },
			orderBy: { id: "desc" }, // Naye customers upar dikhenge
		});

		const employees = await prisma.employee.findMany({
			where: { messId: messId },
		});

		const parcels = await prisma.parcel.findMany({
			where: { messId: messId },
			include: { customer: true }, // Parcel ke sath customer ka naam/address bhi fetch karna
		});

		// 3. Stats Calculate karna
		const total = customers.length;
		const active = customers.filter((c) => c.daysLeft > 0).length;
		const expiring = customers.filter(
			(c) => c.daysLeft > 0 && c.daysLeft <= 3,
		).length;
		const expired = customers.filter((c) => c.daysLeft <= 0).length;

		// 4. Data frontend ko bhejna
		return NextResponse.json(
			{
				stats: { total, active, expiring, expired },
				customers,
				employees,
				parcels,
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
