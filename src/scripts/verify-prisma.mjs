const run = async () => {
  try {
    const mod = await import('../generated/prisma/client');
    const { PrismaClient } = mod;
    const prisma = new PrismaClient();

    const rows = await prisma.member.findMany({ take: 1 });
    console.log('member rows:', rows.length);

    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('verify-prisma error:', e);
    process.exit(1);
  }
};

run();
