import { prisma } from "@/lib/prisma";

const defaultMessId = "main-mess";
const ownerNumberKey = "ownerNumber";

const toDateValue = (date) => date.toISOString().slice(0, 10);

export const serializeMess = (mess) => ({
  id: mess.id,
  name: mess.name,
});

export const serializeMember = (member) => ({
  id: member.id,
  messId: member.messId,
  name: member.name,
  mobile: member.mobile,
  registrationDate: toDateValue(member.registrationDate),
  paymentDate: member.paymentDate ? toDateValue(member.paymentDate) : null,
  durationDays: member.durationDays,
  remainingAmount: member.remainingAmount || 0,
  mealsPerDay: member.mealsPerDay || 2,
  amount: member.amount,
  plan: member.plan,
  renewals: (member.renewals || []).map((renewal) => ({
    id: renewal.id,
    paymentDate: toDateValue(renewal.paymentDate),
    durationDays: renewal.durationDays,
    amount: renewal.amount,
    mealsPerDay: renewal.mealsPerDay || 2,
    plan: renewal.plan,
  })),
});

export const ensureDefaultMess = async () => {
  const existingMess = await prisma.mess.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (existingMess) {
    return existingMess;
  }

  return prisma.mess.create({
    data: {
      id: defaultMessId,
      name: "Main Mess",
    },
  });
};

export const getMesses = async () => {
  await ensureDefaultMess();

  const messes = await prisma.mess.findMany({
    orderBy: [{ createdAt: "asc" }, { name: "asc" }],
  });

  return messes.map(serializeMess);
};

export const getMembers = async (messId) => {
  const members = await prisma.member.findMany({
    where: { messId },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    include: {
      renewals: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });

  return members.map(serializeMember);
};

export const getOwnerNumber = async (messId) => {
  const setting = await prisma.setting.findUnique({
    where: {
      messId_key: {
        messId,
        key: ownerNumberKey,
      },
    },
  });

  return setting?.value || "";
};

export const getDashboardData = async (requestedMessId) => {
  const messes = await getMesses();
  const activeMess =
    messes.find((mess) => mess.id === requestedMessId) || messes[0];

  const [members, ownerNumber] = await Promise.all([
    getMembers(activeMess.id),
    getOwnerNumber(activeMess.id),
  ]);

  return {
    messes,
    activeMess,
    members,
    ownerNumber,
  };
};

export { ownerNumberKey };
