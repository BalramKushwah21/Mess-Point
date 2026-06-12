import { prisma } from "@/lib/prisma";

// Default subscription plans
export const DEFAULT_PLANS = {
  free: {
    name: "Free",
    price: 0,
    billingCycle: "monthly",
    maxMesses: 1,
    maxMembers: 50,
    whatsappAlerts: true,
    customBranding: false,
    advancedReporting: false,
    description: "Perfect for getting started",
  },
  basic: {
    name: "Basic",
    price: 29900, // ₹299 in paise
    billingCycle: "monthly",
    maxMesses: 3,
    maxMembers: 500,
    whatsappAlerts: true,
    customBranding: false,
    advancedReporting: false,
    description: "For growing mess businesses",
  },
  pro: {
    name: "Pro",
    price: 99900, // ₹999 in paise
    billingCycle: "monthly",
    maxMesses: 999999, // unlimited
    maxMembers: 999999, // unlimited
    whatsappAlerts: true,
    customBranding: true,
    advancedReporting: true,
    description: "For professional operations",
  },
};

export async function initializeDefaultPlans() {
  for (const [key, planData] of Object.entries(DEFAULT_PLANS)) {
    const existing = await prisma.plan.findUnique({
      where: { name: planData.name },
    });

    if (!existing) {
      await prisma.plan.create({
        data: planData,
      });
    }
  }
}

export async function getSubscriptionStatus(userId) {
  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { plan: true },
  });

  if (!subscription) {
    return null;
  }

  const now = new Date();
  let status = subscription.status;

  // Check if trial has expired
  if (status === "trial" && subscription.trialEndDate && now > subscription.trialEndDate) {
    status = "expired";
  }

  // Check if subscription has expired
  if (subscription.endDate && now > subscription.endDate) {
    status = "expired";
  }

  return {
    ...subscription,
    status,
    isActive: status === "active" || status === "trial",
    daysLeft: subscription.endDate
      ? Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24))
      : null,
  };
}

export async function canCreateMess(userId) {
  const subscription = await getSubscriptionStatus(userId);
  if (!subscription?.isActive) {
    return { allowed: false, reason: "subscription_inactive" };
  }

  const messCount = await prisma.mess.count({ where: { userId } });
  if (messCount >= subscription.plan.maxMesses) {
    return { allowed: false, reason: "limit_reached" };
  }

  return { allowed: true };
}

export async function canAddMember(userId) {
  const subscription = await getSubscriptionStatus(userId);
  if (!subscription?.isActive) {
    return { allowed: false, reason: "subscription_inactive" };
  }

  const memberCount = await prisma.member.count({
    where: {
      mess: { userId },
    },
  });

  if (memberCount >= subscription.plan.maxMembers) {
    return { allowed: false, reason: "limit_reached" };
  }

  return { allowed: true };
}

export async function createTrialSubscription(userId, planId = null) {
  // Get Pro plan for trial
  let plan = await prisma.plan.findUnique({
    where: { name: "Pro" },
  });

  if (!plan) {
    // Fallback to creating Pro plan
    plan = await prisma.plan.create({
      data: DEFAULT_PLANS.pro,
    });
  }

  const startDate = new Date();
  const trialEndDate = new Date(startDate);
  trialEndDate.setDate(trialEndDate.getDate() + 14); // 14-day trial

  return prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: "trial",
      startDate,
      trialEndDate,
      renewalDate: trialEndDate,
    },
    include: { plan: true },
  });
}

export async function createFreeSubscription(userId) {
  const plan = await prisma.plan.findUnique({
    where: { name: "Free" },
  });

  if (!plan) {
    throw new Error("Free plan not found");
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1); // 1 year validity

  return prisma.subscription.create({
    data: {
      userId,
      planId: plan.id,
      status: "active",
      startDate,
      endDate,
    },
    include: { plan: true },
  });
}

export function formatSubscriptionStatus(status) {
  const statusMap = {
    active: "Active",
    trial: "Trial",
    expired: "Expired",
    cancelled: "Cancelled",
    suspended: "Suspended",
  };
  return statusMap[status] || status;
}

export function formatPrice(paise) {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}
