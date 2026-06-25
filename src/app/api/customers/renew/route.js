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
			startDate, // Frontend se aayi hui start date
			paymentDate, // Frontend se aayi hui payment date
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

		// 5. Database Transactions (Atomicity)
		const transaction = await prisma.$transaction(async (prisma) => {
			// Handle Dates: Convert string to Date objects
			let updatedStartDate = undefined;
			if (startDate) {
				const sDate = new Date(startDate);
				if (!isNaN(sDate.getTime())) updatedStartDate = sDate;
			}

			let updatedPaymentDate = undefined;
			if (paymentDate) {
				const pDate = new Date(paymentDate);
				if (!isNaN(pDate.getTime())) updatedPaymentDate = pDate;
			}

			// Fallback for payment date if not provided but payment is made
			if (parsedPaidAmount > 0 && !updatedPaymentDate) {
				updatedPaymentDate = new Date();
			}

			// Step A: Customer Table Update
			const updatedCustomer = await prisma.customer.update({
				where: { id: customerId },
				data: {
					name,
					phone,
					address,
					mealsPerDay: parseInt(mealsPerDay),
					deliveryType,

					// FIXED: Changed 'membershipStart' to 'startDate'
					...(updatedStartDate && { startDate: updatedStartDate }),
					...(updatedPaymentDate && {
						paymentDate: updatedPaymentDate,
					}),

					numberOfDays: { increment: parsedAddedDays },
					daysLeft: { increment: parsedAddedDays },

					totalAmount: { increment: parsedBillAmount },
					paidAmount: { increment: parsedPaidAmount },
					remainingAmount: newRemainingAmount,
					paymentStatus: newPaymentStatus,
				},
			});

			// Step B: Payment History Table
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
