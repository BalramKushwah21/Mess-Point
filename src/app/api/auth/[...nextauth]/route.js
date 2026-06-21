import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				// 1. Basic Validation
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Email aur password dono zaroori hain!");
				}

				// 2. Database mein Owner (Tenant) ko email se dhoondein
				const owner = await prisma.owner.findUnique({
					where: { email: credentials.email },
					include: {
						mess: true, // Owner ke sath uski Mess ki details bhi fetch karein
					},
				});
			

				// Agar email database mein nahi hai
				if (!owner) {
					throw new Error(
						"Is email se koi account nahi mila. Kripya naya account banayein.",
					);
				}

				// 3. Password Verify Karein (Bcrypt ka use karke)
				const isPasswordValid = await bcrypt.compare(
					credentials.password,
					owner.password,
				);

				// Agar password match nahi karta
				if (!isPasswordValid) {
					throw new Error(
						"Galat password! Kripya dobara try karein.",
					);
				}

				// 4. Successful Login - Return user object
				return {
					id: owner.id.toString(),
					email: owner.email,
					name: owner.firstName + " " + owner.lastName,
					messId: owner.mess?.id,
					messSlug: owner.mess?.slug,
					// NAYA CODE: Mess object se subscription expiry date nikal rahe hain
					subscriptionEndDate: owner.mess?.subscriptionEndDate,
				};
			},
		}),
	],
	callbacks: {
		// JWT Token mein custom data daalne ke liye
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.messId = user.messId;
				token.messSlug = user.messSlug;
				// NAYA CODE: Token mein expiry date save kar rahe hain
				token.subscriptionEndDate = user.subscriptionEndDate;
			}
			return token;
		},
		// Frontend session mein custom data bhejne ke liye
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id;
				session.user.messId = token.messId;
				session.user.messSlug = token.messSlug;
				// NAYA CODE: Frontend aur Middleware ke liye session mein add kar rahe hain
				session.user.subscriptionEndDate = token.subscriptionEndDate;
			}
			return session;
		},
	},
	pages: {
		signIn: "/auth/login", // Custom login page ka path
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// Next.js App Router ke liye GET aur POST dono export karna zaroori hai
export { handler as GET, handler as POST };
