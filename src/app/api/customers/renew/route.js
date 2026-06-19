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
		const body = await request.json();

		// Frontend se aane wali editable details aur naye payment/days
		const {
			id,
			name,
			phone,
			address,
			plan,
			mealsPerDay,
			deliveryType,
			addedDays,
			billAmount,
			paidAmount,
			paymentStatus,
		} = body;

		// 1. Pehle customer ka purana data fetch karein
		const currentCustomer = await prisma.customer.findUnique({
			where: { id: parseInt(id) },
		});

		// 2. Naye totals calculate karein
		const newDaysLeft = currentCustomer.daysLeft + parseInt(addedDays);
		const newTotalAmount =
			currentCustomer.totalAmount + parseInt(billAmount);

		// Udhaar Calculation: (Purana Udhaar + Naya Bill - Aaj ka Jama)
		const currentRemaining = currentCustomer.remainingAmount;
		const newRemainingAmount = Math.max(
			currentRemaining + parseInt(billAmount) - parseInt(paidAmount),
			0,
		);

		// 3. Customer Data Update Karein (Editable Fields + New Calculations)
		const updatedCustomer = await prisma.customer.update({
			where: { id: parseInt(id) },
			data: {
				name,
				phone,
				address,
				plan,
				mealsPerDay: parseInt(mealsPerDay),
				deliveryType,
				daysLeft: newDaysLeft,
				totalAmount: newTotalAmount,
				remainingAmount: newRemainingAmount,
				paymentStatus: newRemainingAmount > 0 ? "Pending" : "Paid",
			},
		});

		// 4. LIFETIME HISTORY LOG CREATE KAREIN (Taki purana record kabhi delete na ho)
		if (addedDays > 0 || billAmount > 0 || paidAmount > 0) {
			await prisma.paymentHistory.create({
				data: {
					customerId: parseInt(id),
					messId: messId,
					addedDays: parseInt(addedDays),
					billAmount: parseInt(billAmount),
					paidAmount: parseInt(paidAmount),
					remainingAmount: newRemainingAmount,
					paymentStatus: paymentStatus,
				},
			});
		}

		return NextResponse.json(
			{ message: "Customer Successfully Updated & Renewed!" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Renew Error:", error);
		return NextResponse.json(
			{ error: "Data save karne mein problem aayi." },
			{ status: 500 },
		);
	}
}
