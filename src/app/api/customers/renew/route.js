import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
	try {
		// 1. Session & Authentication Check
		const session = await getServerSession(authOptions);
		if (!session || !session.user || !session.user.messId) {
			return NextResponse.json(
				{ error: "Unauthorized access. Please log in." },
				{ status: 401 },
			);
		}

		const messId = parseInt(session.user.messId);
		const body = await request.json();

		// 2. Data Destructuring from Frontend Payload
		const {
			id,
			name,
			phone,
			address,
			mealsPerDay,
			deliveryType,
			addedDays,
			billAmount,
			paidAmount,
		} = body;

		const customerId = parseInt(id);
		const parsedAddedDays = parseInt(addedDays) || 0;
		const parsedBillAmount = parseInt(billAmount) || 0;
		const parsedPaidAmount = parseInt(paidAmount) || 0;

		// 3. Security: Fetch existing customer to calculate current dues correctly
		const existingCustomer = await prisma.customer.findUnique({
			where: { id: customerId, messId: messId },
		});

		if (!existingCustomer) {
			return NextResponse.json(
				{ error: "Customer not found or access denied." },
				{ status: 404 },
			);
		}

		// 4. Mathematical Calculations
		// Naya bacha hua paisa = (Purana baki + Naya Bill) - Naya Paid Amount
		const newRemainingAmount =
			existingCustomer.remainingAmount +
			parsedBillAmount -
			parsedPaidAmount;

		// Payment Status Logic
		let newPaymentStatus = "Pending";
		if (newRemainingAmount <= 0) {
			newPaymentStatus = "Paid";
		} else if (parsedPaidAmount > 0 || existingCustomer.paidAmount > 0) {
			newPaymentStatus = "Partial";
		}

		// 5. Database Transactions (Atomicity: Ek fail hua toh sab fail)
		const transaction = await prisma.$transaction(async (prisma) => {
			// Step A: Customer Table Update Karein [cite: 333, 335]
			const updatedCustomer = await prisma.customer.update({
				where: { id: customerId },
				data: {
					name,
					phone,
					address,
					mealsPerDay: parseInt(mealsPerDay),
					deliveryType,
					// Yeh sabse important logic hai jisse din badhenge:
					numberOfDays: { increment: parsedAddedDays },
					daysLeft: { increment: parsedAddedDays },

					totalAmount: { increment: parsedBillAmount },
					paidAmount: { increment: parsedPaidAmount },
					remainingAmount: newRemainingAmount,
					paymentStatus: newPaymentStatus,

					// Agar koi payment kari gayi hai, toh payment date update karein
					...(parsedPaidAmount > 0 && { paymentDate: new Date() }),
				},
			});

			// Step B: Payment History Table mein log save karein [cite: 336, 337]
			// Sirf tab create karein jab actually mein kuch data add hua ho
			if (
				parsedAddedDays > 0 ||
				parsedBillAmount > 0 ||
				parsedPaidAmount > 0
			) {
				await prisma.paymentHistory.create({
					data: {
						customerId: customerId,
						messId: messId,
						addedDays: parsedAddedDays,
						billAmount: parsedBillAmount,
						paidAmount: parsedPaidAmount,
						remainingAmount: newRemainingAmount,
						paymentStatus: newPaymentStatus,
					},
				});
			}

			return updatedCustomer;
		});

		// 6. Success Response
		return NextResponse.json(
			{ success: true, customer: transaction },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Error in Renewing Customer:", error);
		return NextResponse.json(
			{ error: "Internal Server Error. Please try again." },
			{ status: 500 },
		);
	}
}
