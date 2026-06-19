import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
			{/* 1. Header & Navigation */}
			<nav className="bg-white shadow-sm p-5 flex justify-between items-center px-4 md:px-10 sticky top-0 z-50">
				<h1 className="text-3xl font-extrabold text-orange-600">
					Mess-Point
				</h1>
				<div className="space-x-4">
					<Link
						href="/auth/login"
						className="text-gray-600 hover:text-orange-600 font-medium"
					>
						Login
					</Link>
					<Link
						href="/auth/mess/register"
						className="bg-orange-600 text-white px-5 py-2 rounded-md font-medium hover:bg-orange-700 transition shadow-sm"
					>
						Register Mess
					</Link>
				</div>
			</nav>

			{/* 2. Hero Section */}
			<header className="text-center py-24 px-4 bg-gradient-to-b from-orange-50 to-gray-50">
				<h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight max-w-4xl mx-auto">
					Apne Mess Business Ko Banao{" "}
					<span className="text-orange-600">Smart aur Digital</span>
				</h2>
				<p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
					Ab register, diary aur hisaab-kitab ka jhanjhat khatam. Ek
					hi platform se apne customers, staff ki haziri, aur parcel
					delivery ko manage karein.
				</p>
				<div className="flex justify-center space-x-4">
					<Link
						href="/register"
						className="bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-700 shadow-lg transition"
					>
						Start 14-Day Free Trial
					</Link>
					<a
						href="#features"
						className="bg-white text-orange-600 border border-orange-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-50 shadow-sm transition"
					>
						See Features
					</a>
				</div>
			</header>

			{/* 3. Core Features Section */}
			<section id="features" className="py-20 bg-white">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<h2 className="text-3xl font-extrabold mb-12">
						Humare Core Features
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Feature 1 */}
						<div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition bg-gray-50">
							<div className="text-5xl mb-4">🧑‍🤝‍🧑</div>
							<h3 className="text-xl font-bold mb-3 text-orange-600">
								Customer & Membership
							</h3>
							<p className="text-gray-600">
								Naye customer add karein, unke daily meals track
								karein, aur membership kitne din bachi hai uska
								poora log maintain karein.
							</p>
						</div>

						{/* Feature 2 */}
						<div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition bg-gray-50">
							<div className="text-5xl mb-4">👨‍🍳</div>
							<h3 className="text-xl font-bold mb-3 text-orange-600">
								Staff & Salary Tracker
							</h3>
							<p className="text-gray-600">
								Apne cook, sweepers aur delivery boys ki daily
								attendance mark karein aur mahine ke aakhir mein
								auto-calculated salary dekhein.
							</p>
						</div>

						{/* Feature 3 */}
						<div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition bg-gray-50">
							<div className="text-5xl mb-4">🛵</div>
							<h3 className="text-xl font-bold mb-3 text-orange-600">
								Parcel Delivery Dashboard
							</h3>
							<p className="text-gray-600">
								Live delivery orders dekhein, customer ka poora
								address track karein, aur direct "Call" button
								se customers se sampark karein.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* 4. Subscription Plans (Pricing) */}
			<section className="py-20 bg-gray-900 text-white">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<h2 className="text-3xl font-extrabold mb-4">
						Aapke Mess Ke Liye Sahi Plan
					</h2>
					<p className="text-gray-400 mb-12 max-w-2xl mx-auto">
						Affordable pricing jo aapke business ke sath grow kare.
						Koi hidden charges nahi.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
						{/* Lite Plan (New ₹299 Plan) */}
						<div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 text-left hover:border-gray-500 transition">
							<h3 className="text-2xl font-bold mb-2">
								Lite Plan
							</h3>
							<p className="text-gray-400 mb-6">
								Naye aur chote mess setups ke liye.
							</p>
							<div className="text-4xl font-extrabold mb-6">
								₹299
								<span className="text-lg font-normal text-gray-400">
									/month
								</span>
							</div>
							<ul className="space-y-3 mb-8 text-gray-300">
								<li>✅ Up to 20 Customers</li>
								<li>✅ Basic Membership Tracking</li>
								<li>✅ 1 Staff Member Limit</li>
								<li>❌ Parcel Delivery Dashboard</li>
							</ul>
							<Link
								href="/register?plan=lite"
								className="block w-full text-center bg-gray-700 text-white px-5 py-3 rounded-lg font-bold hover:bg-gray-600 transition"
							>
								Choose Lite
							</Link>
						</div>

						{/* Basic Plan */}
						<div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 text-left hover:border-gray-500 transition">
							<h3 className="text-2xl font-bold mb-2">
								Basic Plan
							</h3>
							<p className="text-gray-400 mb-6">
								Growing mess owners ke liye best.
							</p>
							<div className="text-4xl font-extrabold mb-6">
								₹499
								<span className="text-lg font-normal text-gray-400">
									/month
								</span>
							</div>
							<ul className="space-y-3 mb-8 text-gray-300">
								<li>✅ Up to 50 Customers</li>
								<li>✅ Advanced Membership Log</li>
								<li>✅ 3 Staff Members Limit</li>
								<li>❌ Parcel Delivery Dashboard</li>
							</ul>
							<Link
								href="/register?plan=basic"
								className="block w-full text-center bg-gray-700 text-white px-5 py-3 rounded-lg font-bold hover:bg-gray-600 transition"
							>
								Choose Basic
							</Link>
						</div>

						{/* Pro Plan */}
						<div className="bg-orange-600 p-8 rounded-2xl border border-orange-500 text-left transform md:-translate-y-4 shadow-2xl relative">
							<div className="absolute top-0 right-0 bg-white text-orange-600 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
								POPULAR
							</div>
							<h3 className="text-2xl font-bold mb-2 text-white">
								Pro Plan
							</h3>
							<p className="text-orange-200 mb-6">
								Bade aur professional mess setups ke liye.
							</p>
							<div className="text-4xl font-extrabold mb-6 text-white">
								₹999
								<span className="text-lg font-normal text-orange-200">
									/month
								</span>
							</div>
							<ul className="space-y-3 mb-8 text-white">
								<li>✅ Unlimited Customers</li>
								<li>✅ Advanced Membership Log</li>
								<li>✅ Unlimited Staff & Salary Tracker</li>
								<li>✅ Live Parcel Delivery Dashboard</li>
								<li>✅ Custom Mess URL (e.g., /your-mess)</li>
							</ul>
							<Link
								href="/register?plan=pro"
								className="block w-full text-center bg-white text-orange-600 px-5 py-3 rounded-lg font-bold hover:bg-gray-50 transition"
							>
								Choose Pro
							</Link>
						</div>
					</div>
				</div>
			</section>

			{/* 5. Footer & CTA */}
			<footer className="bg-white py-12 text-center border-t border-gray-200">
				<h2 className="text-2xl font-bold mb-4">
					Aaj hi apna Mess digital karein!
				</h2>
				<Link
					href="/register"
					className="inline-block bg-orange-600 text-white px-8 py-3 rounded-md font-bold hover:bg-orange-700 transition shadow-md mb-8"
				>
					Register Your Mess Now
				</Link>
				<p className="text-gray-500 text-sm">
					© 2026 Mess-Point. All rights reserved.
				</p>
			</footer>
		</div>
	);
}
