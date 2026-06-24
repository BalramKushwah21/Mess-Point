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
		const rawCustomers = await prisma.customer.findMany({
			where: { messId: messId },
			orderBy: { id: "desc" },
		});

		// ================= DATE LOGIC (AAPKA FORMULA) =================
		const today = new Date();
		// Timezone/Time-of-day issues se bachne ke liye dono dates ko midnight par set karna
		const normalizedToday = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
		);

		const customers = rawCustomers.map((customer) => {
			const startDate = new Date(customer.startDate);
			const normalizedStart = new Date(
				startDate.getFullYear(),
				startDate.getMonth(),
				startDate.getDate(),
			);

			// Milliseconds ko Days mein convert karna
			const differenceInTime =
				normalizedToday.getTime() - normalizedStart.getTime();
			const differenceInDays = Math.floor(
				differenceInTime / (1000 * 60 * 60 * 24),
			);

			// Formula: numberOfDays - (todayDate - startDate)
			const calculatedDaysLeft = customer.numberOfDays - differenceInDays;

			return {
				...customer,
				daysLeft: calculatedDaysLeft, // Ye database value ko override kar dega
			};
		});
		// ==============================================================

		// 3. Fetch Employees
		const employees = await prisma.employee.findMany({
			where: { messId: messId },
			orderBy: { name: "asc" },
		});

		// 4. Fetch Active Parcels from Database
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

		// 5. Stats Calculate (Ab naye dynamic daysLeft par base karega)
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
				customers, // Ye array ab dynamically calculated daysLeft bhejegi
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
