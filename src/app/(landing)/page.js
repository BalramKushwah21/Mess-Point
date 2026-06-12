"use client";

import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "₹0",
    billing: "/month",
    description: "Perfect for getting started",
    features: [
      "1 Mess",
      "50 Members",
      "Basic WhatsApp Alerts",
      "Payment Tracking",
      "14-day trial of Pro features",
    ],
    cta: "Get Free Access",
    highlight: false,
  },
  {
    name: "Basic",
    price: "₹299",
    billing: "/month",
    description: "For growing mess businesses",
    features: [
      "3 Messes",
      "500 Members",
      "WhatsApp Alerts",
      "Payment Tracking",
      "Email Support",
      "Member Analytics",
    ],
    cta: "Start Basic",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₹999",
    billing: "/month",
    description: "For professional operations",
    features: [
      "Unlimited Messes",
      "Unlimited Members",
      "WhatsApp Alerts",
      "Custom Branding",
      "Advanced Analytics",
      "Priority Support",
      "Payment History Reports",
    ],
    cta: "Start Pro Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₹2,999",
    billing: "/month",
    description: "For large operations",
    features: [
      "Everything in Pro",
      "API Access",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Advanced Reporting",
      "SLA Support",
      "White-label Option",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f7f4]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-950">Mess Manager</h1>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 rounded-md transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold bg-teal-700 text-white rounded-md hover:bg-teal-800 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600 mb-4">
            Smart Mess Management
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 mb-6 leading-tight">
            Manage Your Mess Like a Pro
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
            Track members, send WhatsApp alerts, manage payments, and run your hostel mess
            efficiently. Simple, powerful, and affordable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 bg-teal-700 text-white font-semibold rounded-md hover:bg-teal-800 transition inline-block"
            >
              Start 14-Day Free Trial
            </Link>
            <button className="px-6 py-3 border-2 border-slate-300 text-slate-950 font-semibold rounded-md hover:border-teal-700 hover:text-teal-700 transition">
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-slate-600 mt-4">🎉 No credit card required • Instant setup</p>
        </div>

        {/* Hero Image */}
        <div className="mt-12 rounded-lg border border-slate-200 bg-linear-to-br from-teal-50 to-slate-50 p-8 sm:p-12 min-h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl mb-4">📊</p>
            <p className="text-slate-600 font-semibold">Beautiful Dashboard • Real-time Insights</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white border-t border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-950 mb-4">
              Everything You Need
            </h3>
            <p className="text-slate-600">Powerful features to manage your mess business</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: "👥",
                title: "Member Management",
                desc: "Add, edit, and track all mess members in one place",
              },
              {
                icon: "💰",
                title: "Payment Tracking",
                desc: "Monitor payments, expiry dates, and payment status",
              },
              {
                icon: "💬",
                title: "WhatsApp Alerts",
                desc: "Send automatic payment reminders via WhatsApp",
              },
              {
                icon: "📊",
                title: "Analytics",
                desc: "Get insights into collections and membership trends",
              },
              {
                icon: "🏢",
                title: "Multi-Mess Support",
                desc: "Manage multiple messes from one account",
              },
              {
                icon: "🔒",
                title: "Secure & Reliable",
                desc: "Bank-level security with 99.9% uptime",
              },
            ].map((feature, idx) => (
              <div key={idx} className="p-6 rounded-lg border border-slate-200 hover:border-teal-300 transition">
                <p className="text-4xl mb-3">{feature.icon}</p>
                <h4 className="text-lg font-bold text-slate-950 mb-2">{feature.title}</h4>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-950 mb-4">
              Simple, Transparent Pricing
            </h3>
            <p className="text-slate-600 mb-6">Choose the perfect plan for your mess business</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-lg border transition ${
                  plan.highlight
                    ? "border-teal-400 bg-gradient-to-br from-teal-50 to-white shadow-lg lg:scale-105"
                    : "border-slate-200 bg-white hover:border-teal-300"
                }`}
              >
                <div className="p-6">
                  {plan.highlight && (
                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-2 text-center">
                      Most Popular
                    </p>
                  )}
                  <h4 className="text-2xl font-bold text-slate-950 mb-1">{plan.name}</h4>
                  <p className="text-xs text-slate-600 mb-4">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-black text-slate-950">{plan.price}</span>
                    <span className="text-slate-600">{plan.billing}</span>
                  </div>

                  <Link
                    href="/register"
                    className={`block w-full py-2.5 px-4 rounded-md font-semibold text-center transition mb-6 ${
                      plan.highlight
                        ? "bg-teal-700 text-white hover:bg-teal-800"
                        : "border border-teal-700 text-teal-700 hover:bg-teal-50"
                    }`}
                  >
                    {plan.cta}
                  </Link>

                  <ul className="space-y-3">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2 text-sm">
                        <span className="text-teal-600 font-bold mt-0.5">✓</span>
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white border-t border-slate-200 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <h3 className="text-3xl sm:text-4xl font-bold text-slate-950 mb-12 text-center">
            Frequently Asked Questions
          </h3>

          <div className="space-y-6">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan anytime. Changes take effect immediately.",
              },
              {
                q: "Is there a setup fee?",
                a: "No! There's no setup fee. You pay only for the plan you choose, no hidden charges.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit/debit cards, UPI, and net banking via Razorpay.",
              },
              {
                q: "Do you offer refunds?",
                a: "Yes, we offer a 7-day money-back guarantee if you're not satisfied.",
              },
              {
                q: "Can I manage multiple messes?",
                a: "Yes! Basic plan allows 3 messes, Pro allows unlimited messes.",
              },
              {
                q: "Is my data secure?",
                a: "Absolutely! We use bank-level encryption and regular security audits.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="pb-6 border-b border-slate-200">
                <h4 className="font-bold text-slate-950 mb-2">{faq.q}</h4>
                <p className="text-slate-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-r from-teal-700 to-teal-800 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center text-white">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Mess?</h3>
          <p className="text-lg text-teal-100 mb-8">
            Get started with a 14-day free trial. No credit card required.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-teal-700 font-bold rounded-md hover:bg-teal-50 transition"
          >
            Start Free Trial Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Mess Manager</h4>
              <p className="text-sm">Smart management for hostel mess businesses.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Mess Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
