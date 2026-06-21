import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Razorpay instance initialize karein .env keys ke sath
const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
	try {
		const body = await req.json();
		const { amount, messId } = body;

		// Validation
		if (!amount || !messId) {
			return NextResponse.json(
				{ error: "Amount aur messId zaroori hai" },
				{ status: 400 },
			);
		}

		// Razorpay order create karna (Razorpay mein amount hamesha paise (paise) mein hota hai)
		const orderOptions = {
			amount: amount * 100, // Example: 500 Rs = 50000 paise
			currency: "INR",
			receipt: `receipt_mess_${messId}_${Date.now()}`,
		};

		const order = await razorpay.orders.create(orderOptions);

		// Database mein Pending payment save karna
		const newPayment = await prisma.platformPayment.create({
			data: {
				messId: parseInt(messId),
				razorpayOrderId: order.id,
				amount: amount * 100,
				status: "PENDING",
			},
		});

		// Frontend ko order details bhejna
		return NextResponse.json(
			{
				message: "Order created successfully",
				orderId: order.id,
				amount: order.amount,
				currency: order.currency,
				dbPaymentId: newPayment.id,
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("Razorpay Order Error:", error);
		return NextResponse.json(
			{ error: "Order create karne mein error aayi" },
			{ status: 500 },
		);
	}
}
