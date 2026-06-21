import { NextResponse } from "next/server";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
	try {
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			messId,
		} = await req.json();

		// 1. Signature Verify Karna
		const sign = razorpay_order_id + "|" + razorpay_payment_id;
		const expectedSign = crypto
			.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
			.update(sign.toString())
			.digest("hex");

		if (razorpay_signature === expectedSign) {
			// 2. Agar valid hai, toh Database mein Payment status "SUCCESS" karein
			await prisma.platformPayment.update({
				where: { razorpayOrderId: razorpay_order_id },
				data: {
					razorpayPaymentId: razorpay_payment_id,
					status: "SUCCESS",
				},
			});

			// 3. Mess ki Expiry Date ko 30 din aage badhayein (+30 days)
			const mess = await prisma.mess.findUnique({
				where: { id: parseInt(messId) },
			});
			const currentExpiry = mess.subscriptionEndDate
				? new Date(mess.subscriptionEndDate)
				: new Date();

			const newExpiryDate = new Date(currentExpiry);
			newExpiryDate.setDate(newExpiryDate.getDate() + 30); // 1 mahine ka plan

			await prisma.mess.update({
				where: { id: parseInt(messId) },
				data: { subscriptionEndDate: newExpiryDate },
			});

			return NextResponse.json(
				{
					message:
						"Payment Verified aur Subscription Update ho gayi!",
				},
				{ status: 200 },
			);
		} else {
			return NextResponse.json(
				{ error: "Invalid payment signature!" },
				{ status: 400 },
			);
		}
	} catch (error) {
		console.error("Verification Error:", error);
		return NextResponse.json(
			{ error: "Verification failed" },
			{ status: 500 },
		);
	}
}
