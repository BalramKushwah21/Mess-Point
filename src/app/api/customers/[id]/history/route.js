import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request, { params }) {
	try {
		// 1. Session & Authentication Check
		const session = await getServerSession(authOptions);

		if (!session || !session.user || !session.user.messId) {
			return NextResponse.json(
				{ error: "Unauthorized access. Please log in." },
				{ status: 401 },
			);
		}

		// 2. Extract params and parse IDs
        const param = await params;
		const customerId = parseInt(param.id);
		const messId = parseInt(session.user.messId);

		// ID validation check
		if (isNaN(customerId)) {
			return NextResponse.json(
				{ error: "Invalid customer ID provided." },
				{ status: 400 },
			);
		}

		// 3. Fetch History with Security Check
		// Yahan customerId aur messId dono pass kar rahe hain taaki
		// ek mess owner kisi doosre mess ke customer ki history na nikal sake.
		const history = await prisma.paymentHistory.findMany({
			where: {
				customerId: customerId,
				messId: messId,
			},
			orderBy: {
				transactionDate: "desc", // Sabse nayi history sabse upar aayegi
			},
		});

		// 4. Send Successful Response
		return NextResponse.json({ history }, { status: 200 });
	} catch (error) {
		console.error("Error fetching customer history:", error);
		return NextResponse.json(
			{ error: "Internal Server Error. Failed to fetch history." },
			{ status: 500 },
		);
	}
}
