import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
	try {
		const { parcelId } = await request.json();

		if (!parcelId) {
			return NextResponse.json(
				{ error: "Parcel ID missing" },
				{ status: 400 },
			);
		}

		// Parcel ko "Delivered" mark karein
		await prisma.parcel.update({
			where: { id: parcelId },
			data: { status: "Delivered" },
		});

		return NextResponse.json(
			{ message: "Delivery Done!" },
			{ status: 200 },
		);
	} catch (error) {
		console.error("Mark Done Error:", error);
		return NextResponse.json({ error: "Server Error" }, { status: 500 });
	}
}
