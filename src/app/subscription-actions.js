"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  getSubscriptionStatus,
  canCreateMess,
  canAddMember,
} from "@/lib/subscription";

async function getCurrentUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value;
}

async function requireAuth() {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getSubscriptionInfo(userId) {
  try {
    const subscription = await getSubscriptionStatus(userId);
    if (!subscription) {
      return { ok: false, message: "No subscription found" };
    }

    return {
      ok: true,
      subscription: {
        id: subscription.id,
        plan: subscription.plan.name,
        status: subscription.status,
        isActive: subscription.isActive,
        daysLeft: subscription.daysLeft,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        renewalDate: subscription.renewalDate,
        trialEndDate: subscription.trialEndDate,
        maxMesses: subscription.plan.maxMesses,
        maxMembers: subscription.plan.maxMembers,
        messesUsed: subscription.messesUsed,
        membersUsed: subscription.membersUsed,
      },
    };
  } catch (error) {
    console.error("Get subscription error:", error);
    return { ok: false, message: "Failed to fetch subscription" };
  }
}

export async function createMessWithSubscriptionCheck(input) {
  try {
    const userId = await requireAuth();

    // Check subscription limits
    const canCreate = await canCreateMess(userId);
    if (!canCreate.allowed) {
      return { ok: false, message: `Cannot create mess: ${canCreate.reason}` };
    }

    const name = String(input?.name || "").trim();
    if (!name) {
      return { ok: false, message: "Mess name is required" };
    }

    const mess = await prisma.mess.create({
      data: {
        userId,
        name,
      },
    });

    // Update usage count
    await prisma.subscription.updateMany({
      where: { userId },
      data: {
        messesUsed: { increment: 1 },
      },
    });

    return { ok: true, message: `${name} created successfully`, mess };
  } catch (error) {
    console.error("Create mess error:", error);
    return { ok: false, message: "Failed to create mess" };
  }
}

export async function getMessesForUser(userId) {
  try {
    const messes = await prisma.mess.findMany({
      where: { userId },
      orderBy: [{ createdAt: "asc" }, { name: "asc" }],
    });

    return messes.map((mess) => ({
      id: mess.id,
      name: mess.name,
    }));
  } catch (error) {
    console.error("Get messes error:", error);
    return [];
  }
}

export async function getMemberCountForUser(userId) {
  try {
    const count = await prisma.member.count({
      where: {
        mess: { userId },
      },
    });
    return count;
  } catch (error) {
    console.error("Get member count error:", error);
    return 0;
  }
}

export async function upgradePlan(userId, newPlanName) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { name: newPlanName },
    });

    if (!plan) {
      return { ok: false, message: "Plan not found" };
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return { ok: false, message: "Subscription not found" };
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: plan.id,
        status: "active",
      },
      include: { plan: true },
    });

    return {
      ok: true,
      message: `Upgraded to ${plan.name} plan`,
      subscription: updated,
    };
  } catch (error) {
    console.error("Upgrade plan error:", error);
    return { ok: false, message: "Failed to upgrade plan" };
  }
}

export async function downgradePlan(userId, newPlanName) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { name: newPlanName },
    });

    if (!plan) {
      return { ok: false, message: "Plan not found" };
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return { ok: false, message: "Subscription not found" };
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        planId: plan.id,
        status: "active",
      },
      include: { plan: true },
    });

    return {
      ok: true,
      message: `Downgraded to ${plan.name} plan`,
      subscription: updated,
    };
  } catch (error) {
    console.error("Downgrade plan error:", error);
    return { ok: false, message: "Failed to downgrade plan" };
  }
}

export async function cancelSubscription(userId) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return { ok: false, message: "Subscription not found" };
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "cancelled",
        endDate: new Date(),
      },
    });

    return { ok: true, message: "Subscription cancelled" };
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return { ok: false, message: "Failed to cancel subscription" };
  }
}

export async function getPaymentHistory(userId) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        subscription: { userId },
      },
      orderBy: { createdAt: "desc" },
      include: { subscription: { include: { plan: true } } },
      take: 50,
    });

    return payments.map((payment) => ({
      id: payment.id,
      amount: (payment.amount / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      }),
      status: payment.status,
      plan: payment.subscription.plan.name,
      createdAt: payment.createdAt,
      orderId: payment.razorpayOrderId,
    }));
  } catch (error) {
    console.error("Get payment history error:", error);
    return [];
  }
}
