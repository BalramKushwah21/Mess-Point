import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Humari banayi hui global prisma file
import bcrypt from "bcryptjs";

export async function POST(request) {
const freeSubscription = 5;



	try {
		// 1. Frontend se aane wale data ko parse karna
		const body = await request.json();
		const {
			firstName,
			lastName,
			email,
			whatsapp,
			password,
			messName,
			address,
			customDomain,
			plan, // Frontend ke finalPayload mein humne isey 'plan' naam se bheja hai
		} = body;

		// 2. Basic Validation (Check karein ki saari fields bhari hain ya nahi)
		if (
			!firstName ||
			!email ||
			!whatsapp ||
			!password ||
			!messName ||
			!customDomain
		) {
			return NextResponse.json(
				{ error: "Kripya saari zaroori details bharein." },
				{ status: 400 },
			);
		}

		// 3. Check Duplicate Data (Kya Email ya WhatsApp pehle se registered hai?)
		const existingOwner = await prisma.owner.findFirst({
			where: {
				OR: [{ email: email }, { whatsapp: whatsapp }],
			},
		});

		if (existingOwner) {
			return NextResponse.json(
				{
					error: "Is Email ya WhatsApp se pehle hi account ban chuka hai.",
				},
				{ status: 409 },
			);
		}

		const existingMess = await prisma.mess.findUnique({
			where: { customDomain: customDomain },
		});

		if (existingMess) {
			return NextResponse.json(
				{
					error: "Yeh URL (slug) pehle se kisi aur ne le liya hai. Kripya doosra naam chunein.",
				},
				{ status: 409 },
			);
		}

		// 4. Password Hashing (Security)
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		const today = new Date();
		// 5. Database Save - Prisma Nested Writes
		// Yeh Owner aur Mess dono tables mein ek saath data banayega aur unhe link kar dega

		const subscriptionDate = new Date();
		// console.log("Aaj ki date:", currentDate.toDateString());

		// 2. 5 din add karein
		currentDate.setDate(currentDate.getDate() + freeSubscription);
		const newRegistration = await prisma.owner.create({
			data: {
				firstName,
				lastName,
				email,
				whatsapp,
				password: hashedPassword,
				mess: {
					create: {
						messName,
						address: address || "",
						customDomain,
						subscriptionPlan: plan || "basic", // Frontend se aaya hua selected plan save hoga
						subscriptionEndDate: subscriptionDate, // Frontend se aaya hua selected plan save hoga
						
					},
				},
			},
			// Frontend ko wapas bhejte waqt Owner aur Mess ki details include karna
			include: {
				mess: true,
			},
		});

		// 6. Success Response
		return NextResponse.json(
			{
				message: "Registration successful!",
				data: {
					ownerId: newRegistration.id,
					messId: newRegistration.mess.id,
					slug: newRegistration.mess.slug,
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Registration Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error. Data save nahi ho paya." },
			{ status: 500 },
		);
	}
}
