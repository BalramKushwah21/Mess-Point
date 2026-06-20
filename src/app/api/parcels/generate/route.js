import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !session.user.messId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 },
			);
		}

		const messId = parseInt(session.user.messId);

		// 1. Un customers ko dhundho jinka aaj parcel jana hai (Active customers)
		const activeCustomers = await prisma.customer.findMany({
			where: {
				messId: messId,
				deliveryType: "Parcel",
				daysLeft: { gt: 0 }, // Jinke din bache hain
			},
		});

		if (activeCustomers.length === 0) {
			return NextResponse.json(
				{ error: "Aaj ke liye koi active parcel customer nahi mila." },
				{ status: 400 },
			);
		}

		// 2. Aaj ki Pending deliveries banayein
		const parcelData = activeCustomers.map((customer) => ({
			messId: messId,
			customerId: customer.id,
			status: "Pending",
			address: customer.address || "Address not provided",
		}));

		// (Optional) Taki button 2 baar dabane se duplicate na bane, pehle aaj ke purane pending delete kar do
		await prisma.parcel.deleteMany({
			where: { messId: messId, status: "Pending" },
		});

		// 3. Database me Save karein
		await prisma.parcel.createMany({
			data: parcelData,
		});

		return NextResponse.json(
			{ message: "Aaj ki deliveries generate ho gayi hain!" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Parcel Generate Error:", error);
		return NextResponse.json({ error: "Server Error" }, { status: 500 });
	}
}
