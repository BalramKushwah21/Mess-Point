"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  normalizePhone,
  isValidEmail,
  isValidPhone,
} from "@/lib/auth-utils";
import {
  createTrialSubscription,
  createFreeSubscription,
  initializeDefaultPlans,
} from "@/lib/subscription";

// Initialize default plans on first run
async function ensureDefaultPlans() {
  const existingPlans = await prisma.plan.count();
  if (existingPlans === 0) {
    await initializeDefaultPlans();
  }
}

export async function registerUser(input) {
  try {
    const { email, phone, firstName, lastName, businessName, password } = input;

    // Validation
    if (!email || !isValidEmail(email)) {
      return { ok: false, message: "Invalid email address" };
    }

    if (!phone || !isValidPhone(phone)) {
      return { ok: false, message: "Invalid phone number (10 digits required)" };
    }

    if (!firstName?.trim() || !lastName?.trim()) {
      return { ok: false, message: "First and last name are required" };
    }

    if (!businessName?.trim()) {
      return { ok: false, message: "Business name is required" };
    }

    if (!password || password.length < 8) {
      return { ok: false, message: "Password must be at least 8 characters" };
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { phone: normalizePhone(phone) }],
      },
    });

    if (existingUser) {
      return {
        ok: false,
        message: existingUser.email === email.toLowerCase()
          ? "Email already registered"
          : "Phone number already registered",
      };
    }

    // Ensure default plans exist
    await ensureDefaultPlans();

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        phone: normalizePhone(phone),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: businessName.trim(),
        passwordHash,
      },
    });

    // Create trial subscription
    await createTrialSubscription(user.id);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return {
      ok: true,
      message: "Account created successfully! You have a 14-day trial.",
      userId: user.id,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { ok: false, message: "Failed to create account. Please try again." };
  }
}

export async function loginUser(input) {
  try {
    const { emailOrPhone, password } = input;

    if (!emailOrPhone || !password) {
      return { ok: false, message: "Email/phone and password are required" };
    }

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone.toLowerCase() },
          { phone: normalizePhone(emailOrPhone) },
        ],
      },
    });

    if (!user) {
      return { ok: false, message: "User not found" };
    }

    if (!user.passwordHash) {
      return {
        ok: false,
        message: "Invalid login method. Please use OTP instead.",
      };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { ok: false, message: "Invalid password" };
    }

    // Check account status
    if (user.status !== "active") {
      return { ok: false, message: `Account is ${user.status}` };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return { ok: true, message: "Logged in successfully", userId: user.id };
  } catch (error) {
    console.error("Login error:", error);
    return { ok: false, message: "Login failed. Please try again." };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("userId");
  return { ok: true };
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        businessName: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function updateUserProfile(userId, input) {
  try {
    const { firstName, lastName, businessName } = input;

    if (!firstName?.trim() || !lastName?.trim()) {
      return { ok: false, message: "First and last name are required" };
    }

    if (!businessName?.trim()) {
      return { ok: false, message: "Business name is required" };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: businessName.trim(),
      },
    });

    return { ok: true, message: "Profile updated successfully", user };
  } catch (error) {
    console.error("Update profile error:", error);
    return { ok: false, message: "Failed to update profile" };
  }
}

export async function changePassword(userId, oldPassword, newPassword) {
  try {
    if (!newPassword || newPassword.length < 8) {
      return {
        ok: false,
        message: "New password must be at least 8 characters",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { ok: false, message: "User not found" };
    }

    // Verify old password
    const isValid = await verifyPassword(oldPassword, user.passwordHash);
    if (!isValid) {
      return { ok: false, message: "Current password is incorrect" };
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    return { ok: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return { ok: false, message: "Failed to change password" };
  }
}

export async function sendOTP(phone) {
  try {
    if (!phone || !isValidPhone(phone)) {
      return { ok: false, message: "Invalid phone number" };
    }

    // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
    // For now, just return success
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, send OTP via SMS
    console.log(`[OTP for ${phone}]: ${otp}`);

    // Store OTP in cache/temp storage (Redis or in-memory)
    // This is a simplified version - use Redis in production
    return {
      ok: true,
      message: "OTP sent to your phone",
      // Remove this in production
      _debug_otp: process.env.NODE_ENV === "development" ? otp : undefined,
    };
  } catch (error) {
    console.error("Send OTP error:", error);
    return { ok: false, message: "Failed to send OTP" };
  }
}

export async function verifyOTPAndLogin(phone, otp) {
  try {
    // TODO: Verify OTP from cache/temp storage
    // This is simplified - implement proper OTP verification

    if (!phone || !otp) {
      return { ok: false, message: "Phone and OTP are required" };
    }

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { phone: normalizePhone(phone) },
    });

    if (!user) {
      // Create new user with OTP login (no password)
      user = await prisma.user.create({
        data: {
          email: `${normalizePhone(phone)}@phoneotp.local`, // Temporary email
          phone: normalizePhone(phone),
          firstName: "User",
          lastName: normalizePhone(phone),
          businessName: "My Mess",
          verified: true,
        },
      });

      // Create trial subscription
      await createTrialSubscription(user.id);
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });

    return { ok: true, message: "Logged in successfully", userId: user.id };
  } catch (error) {
    console.error("Verify OTP error:", error);
    return { ok: false, message: "OTP verification failed" };
  }
}
