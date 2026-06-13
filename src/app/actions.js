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
  const dateValue = String(value || "").slice(0, 10);

  if (!dateValue) {
    return null;
  }

  const date = new Date(`${dateValue}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
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

  const memberData = (() => {
    const registrationDate =
      parseDate(input?.registrationDate) || parseDate(todayValue());
    let paymentDate = parseDate(input?.paymentDate);
    const durationDays = parsePositiveInt(input?.durationDays, 30);
    const amount = parseNonNegativeInt(input?.amount, 0);

    const data = {
      name,
      mobile,
      registrationDate,
      durationDays,
      amount,
      plan,
    };
    const mealsPerDay = parsePositiveInt(input?.mealsPerDay, 2);
    const remainingAmount = parseNonNegativeInt(input?.remainingAmount, 0);

    // The DB currently requires paymentDate non-null; default to registrationDate when missing
    if (!paymentDate) {
      paymentDate = registrationDate;
    }

    data.paymentDate = paymentDate;
    data.remainingAmount = remainingAmount;
    data.mealsPerDay = mealsPerDay;

    return data;
  })();

  await prisma.member.create({
    data: {
      ...memberData,
      mess: { connect: { id: mess.id } },
      renewals: {
        create: {
          paymentDate: memberData.paymentDate,
          durationDays: memberData.durationDays,
          amount: memberData.amount,
          mealsPerDay: memberData.mealsPerDay,
          plan: memberData.plan,
        },
      },
    },
  });

  return dashboardResult(mess.id, `${name} added successfully.`);
}

export async function renewMember(messId, memberId) {
  const mess = await getMessOrThrow(messId);

  const member = await prisma.member.findFirst({
    where: {
      id: String(memberId || ""),
      messId: mess.id,
    },
    select: {
      id: true,
      durationDays: true,
      amount: true,
      plan: true,
    },
  });

  if (!member) {
    throw new Error("Member not found.");
  }

  const paymentDate = parseDate(todayValue());

  await prisma.member.update({
    where: { id: member.id },
    data: {
      paymentDate,
      renewals: {
        create: {
          paymentDate,
          durationDays: member.durationDays,
          amount: member.amount,
          plan: member.plan,
        },
      },
    },
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
