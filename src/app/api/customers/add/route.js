import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user || !session.user.messId) {
			return NextResponse.json(
				{ error: "Unauthorized! Kripya pehle login karein." },
				{ status: 401 },
			);
		}

		const messId = parseInt(session.user.messId);
		const body = await request.json();

		// Frontend se aane wale naye amount fields
		const {
			name,
			phone,
			address,
			plan,
			mealsPerDay,
			deliveryType,
			startDate,
			paymentDate,
			numberOfDays,
			paymentStatus,
			paidAmount,
			remainingAmount, // <--- YAHAN ADD KIYA
		} = body;

		if (!name || !phone || !address || !startDate || !numberOfDays) {
			return NextResponse.json(
				{ error: "Kripya saari zaroori details bharein." },
				{ status: 400 },
			);
		}

		const newCustomer = await prisma.customer.create({
			data: {
				messId: messId,
				name: name,
				phone: phone,
				address: address,
				plan: plan,
				mealsPerDay: parseInt(mealsPerDay),
				deliveryType: deliveryType,
				startDate: new Date(startDate),
				paymentDate: paymentDate ? new Date(paymentDate) : null,
				numberOfDays: parseInt(numberOfDays),
				daysLeft: parseInt(numberOfDays),

				// Database mein new fields save karna
				paidAmount: parseInt(paidAmount) || 0,
				remainingAmount: parseInt(remainingAmount) || 0,
				paymentStatus: paymentStatus,
			},
		});

		return NextResponse.json(
			{
				message: "Customer successfully add ho gaya!",
				customer: newCustomer,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Add Customer Backend Error:", error);
		return NextResponse.json(
			{ error: "System mein kuch gadbad hai. Data save nahi ho paya." },
			{ status: 500 },
		);
	}
}
