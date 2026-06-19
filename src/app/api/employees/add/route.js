import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
	try {
		// 1. Check Authentication & Get Tenant (Mess) ID
		// Isse pata chalega ki kaunsa owner login hai aur employee kis mess mein add karna hai
		const session = await getServerSession(authOptions);

		if (!session || !session.user || !session.user.messId) {
			return NextResponse.json(
				{ error: "Unauthorized! Kripya pehle login karein." },
				{ status: 401 },
			);
		}

		const messId = parseInt(session.user.messId);

		// 2. Frontend form se aane wale data ko parse karna
		const body = await request.json();
		const { name, role, baseSalary } = body;

		// 3. Basic Validation
		if (!name || !role || !baseSalary) {
			return NextResponse.json(
				{
					error: "Kripya saari zaroori details (Name, Role, Salary) bharein.",
				},
				{ status: 400 },
			);
		}

		// 4. Prisma ke zariye Database mein Employee Save karna
		const newEmployee = await prisma.employee.create({
			data: {
				messId: messId, // Tenant relation
				name: name,
				role: role,
				baseSalary: parseInt(baseSalary), // Text input ko number mein convert kar rahe hain
			},
		});

		// 5. Success Response wapas frontend ko bhejna
		return NextResponse.json(
			{
				message: "Naya staff member successfully add ho gaya!",
				employee: newEmployee,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Add Employee Backend Error:", error);
		return NextResponse.json(
			{ error: "System mein kuch gadbad hai. Data save nahi ho paya." },
			{ status: 500 },
		);
	}
}
