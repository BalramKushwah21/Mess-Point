// Razorpay Integration Utilities
// Install: npm install razorpay

export function initializeRazorpay() {
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key || !secret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set");
  }

  // Dynamic import to avoid issues in edge runtime
  const Razorpay = require("razorpay").default;
  return new Razorpay({
    key_id: key,
    key_secret: secret,
  });
}

export async function createRazorpayOrder(amount, receipt, notes = {}) {
  const razorpay = initializeRazorpay();

  const order = await razorpay.orders.create({
    amount: amount, // in paise
    currency: "INR",
    receipt,
    notes,
  });

  return order;
}

export async function createRazorpaySubscription(
  planDetails,
  customerId,
  subscriptionNotes = {}
) {
  const razorpay = initializeRazorpay();

  // Create subscription
  const subscription = await razorpay.subscriptions.create({
    plan_id: planDetails.razorpayPlanId,
    customer_id: customerId,
    quantity: 1,
    total_count: 12, // 12 months, or adjust based on plan
    start_at: Math.floor(new Date().getTime() / 1000) + 86400, // Start tomorrow
    notes: subscriptionNotes,
  });

  return subscription;
}

export async function verifyRazorpayPayment(
  orderId,
  paymentId,
  signature,
  secret = process.env.RAZORPAY_KEY_SECRET
) {
  const crypto = require("crypto");

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === signature;
}

export async function verifyRazorpayWebhook(body, signature) {
  const crypto = require("crypto");
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET not set");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");

  return expectedSignature === signature;
}

export function formatRazorpayAmount(paise) {
  return (paise / 100).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
}

// Format phone for Razorpay API
export function formatPhoneForRazorpay(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

// Example webhook event handler
export async function handleRazorpayWebhookEvent(event, { prisma }) {
  const { event: eventType, payload } = event;

  switch (eventType) {
    case "subscription.activated":
      return handleSubscriptionActivated(payload, prisma);
    case "subscription.completed":
      return handleSubscriptionCompleted(payload, prisma);
    case "subscription.updated":
      return handleSubscriptionUpdated(payload, prisma);
    case "subscription.pending":
      return handleSubscriptionPending(payload, prisma);
    case "subscription.halted":
      return handleSubscriptionHalted(payload, prisma);
    case "subscription.resumed":
      return handleSubscriptionResumed(payload, prisma);
    case "subscription.cancelled":
      return handleSubscriptionCancelled(payload, prisma);
    case "payment.authorized":
      return handlePaymentAuthorized(payload, prisma);
    case "payment.captured":
      return handlePaymentCaptured(payload, prisma);
    case "payment.failed":
      return handlePaymentFailed(payload, prisma);
    default:
      console.log(`Unhandled webhook event: ${eventType}`);
      return { handled: false };
  }
}

async function handleSubscriptionActivated(payload, prisma) {
  const { id, customer_id, plan_id } = payload.subscription;
  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: id },
    data: { status: "active", razorpayCustomerId: customer_id },
  });
  return { handled: true };
}

async function handleSubscriptionCompleted(payload, prisma) {
  const { id } = payload.subscription;
  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: id },
    data: { status: "completed", endDate: new Date() },
  });
  return { handled: true };
}

async function handleSubscriptionUpdated(payload, prisma) {
  const { id, plan_id } = payload.subscription;
  const plan = await prisma.plan.findFirst({
    where: { /* match with razorpay plan_id */ },
  });
  if (plan) {
    await prisma.subscription.updateMany({
      where: { razorpaySubscriptionId: id },
      data: { planId: plan.id },
    });
  }
  return { handled: true };
}

async function handleSubscriptionPending(payload, prisma) {
  const { id } = payload.subscription;
  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: id },
    data: { status: "pending" },
  });
  return { handled: true };
}

async function handleSubscriptionHalted(payload, prisma) {
  const { id } = payload.subscription;
  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: id },
    data: { status: "suspended" },
  });
  return { handled: true };
}

async function handleSubscriptionResumed(payload, prisma) {
  const { id } = payload.subscription;
  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: id },
    data: { status: "active" },
  });
  return { handled: true };
}

async function handleSubscriptionCancelled(payload, prisma) {
  const { id } = payload.subscription;
  await prisma.subscription.updateMany({
    where: { razorpaySubscriptionId: id },
    data: { status: "cancelled", endDate: new Date() },
  });
  return { handled: true };
}

async function handlePaymentAuthorized(payload, prisma) {
  const { id: paymentId, order_id } = payload.payment;
  await prisma.payment.updateMany({
    where: { razorpayPaymentId: paymentId },
    data: { status: "authorized" },
  });
  return { handled: true };
}

async function handlePaymentCaptured(payload, prisma) {
  const { id: paymentId, order_id } = payload.payment;
  await prisma.payment.updateMany({
    where: { razorpayPaymentId: paymentId },
    data: { status: "captured" },
  });
  return { handled: true };
}

async function handlePaymentFailed(payload, prisma) {
  const { id: paymentId } = payload.payment;
  await prisma.payment.updateMany({
    where: { razorpayPaymentId: paymentId },
    data: { status: "failed" },
  });
  return { handled: true };
}
