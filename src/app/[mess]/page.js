import prisma from "../../lib/prisma";
import Link from "next/link";

export default async function DynamicMessPage({ params }) {
	try {
		// 1. URL se slug uthayein (e.g., "sharma-tiffin")
		const domain = await params;
		const currentSlug = domain.mess;

		// 2. Database se us specific mess ki details fetch karein
		const messData = await prisma.mess.findUnique({
			// DHYAN DEIN: Agar aapke schema mein unique field 'slug' hai toh isey slug rakhein.
			where: { customDomain: currentSlug },
		});

		// 3. Agar us naam ka koi mess nahi milta (Graceful 404 UI)
		if (!messData) {
			return (
				<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
					<div className="text-6xl mb-4">🔍</div>
					<h1 className="text-4xl font-extrabold text-gray-800 mb-2">
						Mess Not Found
					</h1>
					<p className="text-lg text-gray-600 mb-8">
						Aap jis Mess ko dhoondh rahe hain, woh is URL par exist
						nahi karta.
					</p>
					<Link
						href="/"
						className="bg-orange-600 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-700 transition"
					>
						Mess-Point Homepage Par Jayein
					</Link>
				</div>
			);
		}

		// 4. Agar mess mil gaya, toh uski details screen par render karein
		return (
			<div className="min-h-screen bg-gray-50 text-gray-900">
				{/* Dynamic Header */}
				<nav className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
					<h1 className="text-3xl font-extrabold text-orange-600">
						{messData.messName}
					</h1>
					<Link
						href={"/auth/login"}
						className="bg-orange-600 text-white px-5 py-2 rounded-md font-medium hover:bg-orange-700 transition"
					>
						Customer Login
					</Link>
				</nav>

				{/* Dynamic Hero Section */}
				<header className="text-center py-24 px-4 bg-orange-50">
					<h2 className="text-5xl font-extrabold mb-6 leading-tight">
						Welcome to{" "}
						<span className="text-orange-600">
							{messData.messName}
						</span>
					</h2>
					<p className="text-xl text-gray-700 mb-4 max-w-2xl mx-auto">
						{messData.about ||
							"Ghar jaisa swadisht khana, ab aapke door-step par!"}
					</p>
					<p className="text-lg font-medium text-gray-500 mb-10">
						📍 {messData.address} | 📞 +91{" "}
						{messData.contact || "Number Not Available"}
					</p>

					{/* FIX: Yahan 'slug' ki jagah 'currentSlug' use kiya gaya hai taaki error na aaye */}
					<Link
						href={`/${currentSlug}/subscribe`}
						className="bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-700 shadow-lg transition"
					>
						Take a Membership
					</Link>
				</header>

				{/* Features Section */}
				<section className="py-16 bg-white">
					<div className="max-w-4xl mx-auto px-4 text-center">
						<h3 className="text-2xl font-bold mb-8">
							Humari Services
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div className="p-6 border rounded-xl shadow-sm">
								<div className="text-4xl mb-4">🍱</div>
								<h4 className="text-xl font-bold mb-2">
									Daily Tiffin Service
								</h4>
								<p className="text-gray-600">
									Fresh aur hygienic khana daily aapke address
									par deliver kiya jayega.
								</p>
							</div>
							<div className="p-6 border rounded-xl shadow-sm">
								<div className="text-4xl mb-4">📅</div>
								<h4 className="text-xl font-bold mb-2">
									Easy Membership Tracking
								</h4>
								<p className="text-gray-600">
									Apni chhuttiyan khud manage karein aur apni
									membership ki validity check karein.
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		);
	} catch (error) {
		// 5. Agar database fail ho jaye (Server Error Graceful UI)
		console.error("Database Fetch Error:", error);
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
				<div className="text-6xl mb-4">⚠️</div>
				<h1 className="text-4xl font-extrabold text-red-600 mb-2">
					System Error
				</h1>
				<p className="text-lg text-gray-600 mb-8">
					Abhi database se connect karne mein issue aa raha hai.
					Kripya thodi der baad refresh karein.
				</p>
			</div>
		);
	}
}
