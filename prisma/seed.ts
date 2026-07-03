import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.operation.deleteMany({ where: { familyId: "demo" } });
  await prisma.food.deleteMany({ where: { familyId: "demo" } });
  await prisma.location.deleteMany({ where: { familyId: "demo" } });
  await prisma.member.deleteMany({ where: { familyId: "demo" } });

  const family = await prisma.family.upsert({
    where: { id: "demo" },
    update: { name: "我们家" },
    create: { id: "demo", name: "我们家" },
  });

  const member = await prisma.member.create({
    data: { familyId: family.id, nickname: "妈妈", role: "admin" },
  });

  const snackCabinet = await prisma.location.create({
    data: {
      familyId: family.id,
      name: "妈妈零食柜",
      tags: JSON.stringify(["常温", "零食"]),
      isFrequent: true,
      sortOrder: 1,
      createdById: member.id,
    },
  });

  await prisma.food.create({
    data: {
      familyId: family.id,
      locationId: snackCabinet.id,
      name: "蛋黄派",
      quantity: 3,
      unit: "包",
      expiresAt: new Date("2026-08-20"),
      source: "manual",
      createdById: member.id,
      lastActorId: member.id,
    },
  });
}

main().finally(() => prisma.$disconnect());
