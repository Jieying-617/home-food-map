import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const familyId = "demo";

const demoNow = new Date("2026-07-04T09:00:00+08:00");

function atDate(date: string) {
  return new Date(`${date}T00:00:00+08:00`);
}

async function main() {
  await prisma.operation.deleteMany({ where: { familyId } });
  await prisma.food.deleteMany({ where: { familyId } });
  await prisma.location.deleteMany({ where: { familyId } });
  await prisma.member.deleteMany({ where: { familyId } });

  const family = await prisma.family.upsert({
    where: { id: familyId },
    update: { name: "我们家" },
    create: { id: familyId, name: "我们家" },
  });

  const [mom, me, dad] = await Promise.all([
    prisma.member.create({ data: { familyId: family.id, nickname: "妈妈", role: "admin" } }),
    prisma.member.create({ data: { familyId: family.id, nickname: "我", role: "member" } }),
    prisma.member.create({ data: { familyId: family.id, nickname: "爸爸", role: "member" } }),
  ]);

  const locations = await Promise.all([
    prisma.location.create({
      data: {
        familyId: family.id,
        name: "妈妈零食柜",
        tags: JSON.stringify(["常温", "零食"]),
        note: "客厅边柜第二层，主要放点心和坚果。",
        isFrequent: true,
        sortOrder: 1,
        createdById: mom.id,
      },
    }),
    prisma.location.create({
      data: {
        familyId: family.id,
        name: "厨房上层干货柜",
        tags: JSON.stringify(["常温", "干货", "调味"]),
        note: "灶台右上方，放面、罐头和调味料。",
        isFrequent: true,
        sortOrder: 2,
        createdById: mom.id,
      },
    }),
    prisma.location.create({
      data: {
        familyId: family.id,
        name: "阳台囤货箱",
        tags: JSON.stringify(["常温", "囤货"]),
        note: "阳台白色收纳箱，放大包装囤货。",
        sortOrder: 3,
        createdById: me.id,
      },
    }),
    prisma.location.create({
      data: {
        familyId: family.id,
        name: "冰箱冷藏层",
        tags: JSON.stringify(["冷藏", "短保"]),
        note: "虽然冰箱不容易忘，但用来测试今天/过期提醒。",
        sortOrder: 4,
        createdById: mom.id,
      },
    }),
    prisma.location.create({
      data: {
        familyId: family.id,
        name: "早餐抽屉",
        tags: JSON.stringify(["常温", "早餐"]),
        note: "餐桌旁抽屉，放面包、麦片和冲饮。",
        sortOrder: 5,
        createdById: dad.id,
      },
    }),
  ]);

  const [snackCabinet, dryCabinet, balconyBox, fridge, breakfastDrawer] = locations;

  const foodInputs = [
    {
      locationId: fridge.id,
      name: "原味酸奶",
      quantity: 2,
      unit: "杯",
      expiresAt: "2026-07-02",
      source: "date-photo",
      note: "已过期，用来测试红色提醒。",
      createdById: mom.id,
    },
    {
      locationId: fridge.id,
      name: "鲜牛奶",
      quantity: 1,
      unit: "盒",
      expiresAt: "2026-07-04",
      source: "date-photo",
      note: "今天到期。",
      createdById: mom.id,
    },
    {
      locationId: fridge.id,
      name: "草莓",
      quantity: 1,
      unit: "盒",
      expiresAt: "2026-07-06",
      source: "manual",
      note: "3 天内到期。",
      createdById: dad.id,
    },
    {
      locationId: breakfastDrawer.id,
      name: "全麦面包",
      quantity: 1,
      unit: "袋",
      expiresAt: "2026-07-09",
      source: "voice",
      note: "一周内到期。",
      createdById: mom.id,
    },
    {
      locationId: snackCabinet.id,
      name: "蛋黄派",
      quantity: 3,
      unit: "包",
      expiresAt: "2026-07-28",
      source: "voice",
      note: "妈妈常忘的零食，30 天内到期。",
      createdById: mom.id,
    },
    {
      locationId: snackCabinet.id,
      name: "海苔卷",
      quantity: 6,
      unit: "包",
      expiresAt: "2026-08-01",
      source: "manual",
      note: "零食柜里另一种 30 天内到期食物。",
      createdById: me.id,
    },
    {
      locationId: snackCabinet.id,
      name: "坚果礼盒",
      quantity: 1,
      unit: "盒",
      expiresAt: "2026-12-31",
      source: "manual",
      note: "长期常温食品，用来测试位置详情里长期库存。",
      createdById: dad.id,
    },
    {
      locationId: dryCabinet.id,
      name: "午餐肉罐头",
      quantity: 4,
      unit: "罐",
      expiresAt: "2027-01-15",
      source: "manual",
      note: "干货柜罐头。",
      createdById: mom.id,
    },
    {
      locationId: dryCabinet.id,
      name: "意面",
      quantity: 2,
      unit: "袋",
      expiresAt: "2026-09-20",
      source: "manual",
      note: "不在 30 天提醒里，但位置详情可见。",
      createdById: me.id,
    },
    {
      locationId: balconyBox.id,
      name: "五常大米",
      quantity: 1,
      unit: "袋",
      expiresAt: "2027-03-01",
      source: "manual",
      note: "阳台囤货箱大包装。",
      createdById: dad.id,
    },
    {
      locationId: balconyBox.id,
      name: "椰汁",
      quantity: 12,
      unit: "盒",
      expiresAt: "2026-11-11",
      source: "date-photo",
      note: "整箱饮料。",
      createdById: me.id,
    },
    {
      locationId: breakfastDrawer.id,
      name: "黑芝麻糊",
      quantity: 8,
      unit: "袋",
      expiresAt: "2026-10-10",
      source: "manual",
      note: "早餐抽屉冲饮。",
      createdById: mom.id,
    },
  ];

  const foods = [];
  for (const input of foodInputs) {
    const food = await prisma.food.create({
      data: {
        familyId: family.id,
        locationId: input.locationId,
        name: input.name,
        quantity: input.quantity,
        unit: input.unit,
        expiresAt: atDate(input.expiresAt),
        source: input.source,
        note: input.note,
        createdById: input.createdById,
        lastActorId: input.createdById,
      },
    });
    foods.push(food);
    await prisma.operation.create({
      data: {
        familyId: family.id,
        foodId: food.id,
        actorId: input.createdById,
        type: "create",
        after: JSON.stringify(food),
        createdAt: demoNow,
      },
    });
  }

  const eggPie = foods.find((food) => food.name === "蛋黄派");
  const bread = foods.find((food) => food.name === "全麦面包");
  const yogurt = foods.find((food) => food.name === "原味酸奶");

  if (eggPie) {
    await prisma.operation.create({
      data: {
        familyId: family.id,
        foodId: eggPie.id,
        actorId: me.id,
        type: "take",
        before: JSON.stringify({ ...eggPie, quantity: 4 }),
        after: JSON.stringify(eggPie),
        createdAt: new Date("2026-07-04T10:30:00+08:00"),
      },
    });
  }

  if (bread) {
    const updated = await prisma.food.update({
      where: { id: bread.id },
      data: { quantity: 0, status: "finished", lastActorId: dad.id },
    });
    await prisma.operation.create({
      data: {
        familyId: family.id,
        foodId: bread.id,
        actorId: dad.id,
        type: "finish",
        before: JSON.stringify(bread),
        after: JSON.stringify(updated),
        createdAt: new Date("2026-07-04T11:10:00+08:00"),
      },
    });
  }

  if (yogurt) {
    const updated = await prisma.food.update({
      where: { id: yogurt.id },
      data: { status: "discarded", lastActorId: mom.id },
    });
    await prisma.operation.create({
      data: {
        familyId: family.id,
        foodId: yogurt.id,
        actorId: mom.id,
        type: "discard",
        before: JSON.stringify(yogurt),
        after: JSON.stringify(updated),
        createdAt: new Date("2026-07-04T11:30:00+08:00"),
      },
    });
  }

  console.log(`Seeded ${locations.length} locations, ${foods.length} foods, and demo operations for ${family.name}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
