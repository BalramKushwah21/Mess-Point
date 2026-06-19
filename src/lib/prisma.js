import { PrismaClient } from "@prisma/client";

// PrismaClient ka ek global instance banate hain
let prisma;

if (process.env.NODE_ENV === "production") {
	// Production mein seedha naya client create karein
	prisma = new PrismaClient();
} else {
	// Development mode mein global object ka use karein taaki hot-reloading se multiple connections na bane
	if (!global.prisma) {
		global.prisma = new PrismaClient();
	}
	prisma = global.prisma;
}

export default prisma;
