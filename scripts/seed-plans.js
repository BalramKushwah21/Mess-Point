#!/usr/bin/env node

/**
 * Seed Script - Initialize Default Plans
 * Usage: node scripts/seed-plans.js
 */

const { PrismaClient } = require("../src/generated/prisma/client");
const prisma = new PrismaClient();

const DEFAULT_PLANS = [
  {
    name: "Free",
    price: 0,
    currency: "INR",
    billingCycle: "monthly",
    maxMesses: 1,
    maxMembers: 50,
    whatsappAlerts: true,
    customBranding: false,
    advancedReporting: false,
    description: "Perfect for getting started",
    isActive: true,
  },
  {
    name: "Basic",
    price: 29900, // ₹299
    currency: "INR",
    billingCycle: "monthly",
    maxMesses: 3,
    maxMembers: 500,
    whatsappAlerts: true,
    customBranding: false,
    advancedReporting: false,
    description: "For growing mess businesses",
    isActive: true,
  },
  {
    name: "Pro",
    price: 99900, // ₹999
    currency: "INR",
    billingCycle: "monthly",
    maxMesses: 999999,
    maxMembers: 999999,
    whatsappAlerts: true,
    customBranding: true,
    advancedReporting: true,
    description: "For professional operations",
    isActive: true,
  },
  {
    name: "Enterprise",
    price: 299900, // ₹2,999
    currency: "INR",
    billingCycle: "monthly",
    maxMesses: 999999,
    maxMembers: 999999,
    whatsappAlerts: true,
    customBranding: true,
    advancedReporting: true,
    description: "For enterprise deployments",
    isActive: true,
  },
];

async function main() {
  try {
    console.log("🌱 Seeding default subscription plans...\n");

    for (const plan of DEFAULT_PLANS) {
      const existing = await prisma.plan.findUnique({
        where: { name: plan.name },
      });

      if (existing) {
        console.log(`✓ ${plan.name} plan already exists`);
      } else {
        const created = await prisma.plan.create({ data: plan });
        console.log(`✓ Created ${plan.name} plan (₹${plan.price / 100}/month)`);
      }
    }

    console.log("\n✅ Seeding completed successfully!");

    // Show summary
    const totalPlans = await prisma.plan.count();
    console.log(`\n📊 Total plans in database: ${totalPlans}`);

    const plans = await prisma.plan.findMany({
      select: { name: true, price: true, maxMesses: true, maxMembers: true },
    });

    console.log("\n📋 Available Plans:");
    plans.forEach((p) => {
      const price = p.price === 0 ? "Free" : `₹${p.price / 100}`;
      console.log(
        `   ${p.name}: ${price}/month | ${p.maxMesses} messes | ${p.maxMembers} members`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
