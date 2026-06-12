"use server";

import { refresh } from "next/cache";

import { getDashboardData, ownerNumberKey } from "@/lib/members";
import { prisma } from "@/lib/prisma";

const todayValue = () => new Date().toISOString().slice(0, 10);

const normalizeWhatsAppNumber = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
};

const parseDate = (value) => {
  const dateValue = String(value || todayValue()).slice(0, 10);
  const date = new Date(`${dateValue}T00:00:00.000Z`);

  return Number.isNaN(date.getTime())
    ? new Date(`${todayValue()}T00:00:00.000Z`)
    : date;
};

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseNonNegativeInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const dashboardResult = async (messId, message) => {
  const data = await getDashboardData(messId);
  refresh();

  return { ok: true, message, data };
};

const getMessOrThrow = async (messId) => {
  const mess = await prisma.mess.findUnique({
    where: { id: String(messId || "") },
  });

  if (!mess) {
    throw new Error("Mess not found.");
  }

  return mess;
};

export async function loadMess(messId) {
  return dashboardResult(messId, "");
}

export async function createMess(input) {
  const name = String(input?.name || "").trim();

  if (!name) {
    return {
      ok: false,
      message: "Add mess name.",
    };
  }

  const mess = await prisma.mess.create({
    data: { name },
  });

  return dashboardResult(mess.id, `${name} created.`);
}

export async function createMember(messId, input) {
  const mess = await getMessOrThrow(messId);
  const name = String(input?.name || "").trim();
  const mobile = normalizeWhatsAppNumber(input?.mobile);
  const plan = String(input?.plan || "").trim() || "Monthly meals";

  if (!name || !mobile) {
    return {
      ok: false,
      message: "Add member name and mobile number.",
    };
  }

  await prisma.member.create({
    data: {
      messId: mess.id,
      name,
      mobile,
      registrationDate: parseDate(input?.registrationDate),
      paymentDate: parseDate(input?.paymentDate),
      durationDays: parsePositiveInt(input?.durationDays, 30),
      amount: parseNonNegativeInt(input?.amount, 0),
      plan,
    },
  });

  return dashboardResult(mess.id, `${name} added successfully.`);
}

export async function renewMember(messId, memberId) {
  const mess = await getMessOrThrow(messId);

  await prisma.member.updateMany({
    where: {
      id: String(memberId || ""),
      messId: mess.id,
    },
    data: { paymentDate: parseDate(todayValue()) },
  });

  return dashboardResult(mess.id, "Member renewed successfully.");
}

export async function deleteMember(messId, memberId) {
  const mess = await getMessOrThrow(messId);

  await prisma.member.deleteMany({
    where: {
      id: String(memberId || ""),
      messId: mess.id,
    },
  });

  return dashboardResult(mess.id, "Member deleted.");
}

export async function saveOwnerNumber(messId, value) {
  const mess = await getMessOrThrow(messId);
  const ownerNumber = String(value || "").trim();

  await prisma.setting.upsert({
    where: {
      messId_key: {
        messId: mess.id,
        key: ownerNumberKey,
      },
    },
    create: {
      messId: mess.id,
      key: ownerNumberKey,
      value: ownerNumber,
    },
    update: { value: ownerNumber },
  });

  refresh();

  return { ok: true, ownerNumber };
}
