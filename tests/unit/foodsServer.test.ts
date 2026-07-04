import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  foodCreate: vi.fn(),
  foodFindUniqueOrThrow: vi.fn(),
  foodUpdate: vi.fn(),
  operationCreate: vi.fn(),
  getCurrentMemberId: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    food: {
      create: mocks.foodCreate,
      findUniqueOrThrow: mocks.foodFindUniqueOrThrow,
      update: mocks.foodUpdate,
    },
    operation: {
      create: mocks.operationCreate,
    },
  },
}));

vi.mock("@/lib/server/currentMember", () => ({
  getCurrentMemberId: mocks.getCurrentMemberId,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

describe("food server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentMemberId.mockResolvedValue("member-1");
  });

  it("records the current member when creating food", async () => {
    const food = {
      id: "food-1",
      familyId: "demo",
      locationId: "loc-1",
      name: "milk",
      quantity: 1,
      unit: "box",
      expiresAt: new Date("2026-07-10"),
      source: "manual",
    };
    mocks.foodCreate.mockResolvedValue(food);

    const { createFood } = await import("@/lib/server/foods");

    await createFood({
      familyId: "demo",
      locationId: "loc-1",
      name: "milk",
      quantity: 1,
      unit: "box",
      expiresAt: "2026-07-10",
      source: "manual",
    });

    expect(mocks.foodCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        createdById: "member-1",
        lastActorId: "member-1",
      }),
    });
    expect(mocks.operationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "member-1",
        familyId: "demo",
        foodId: "food-1",
        type: "create",
      }),
    });
  });

  it("records the current member when updating inventory", async () => {
    mocks.foodFindUniqueOrThrow.mockResolvedValue({
      id: "food-1",
      familyId: "demo",
      name: "milk",
      quantity: 2,
      unit: "box",
      status: "active",
    });
    mocks.foodUpdate.mockResolvedValue({
      id: "food-1",
      quantity: 1,
      status: "active",
      lastActorId: "member-1",
    });

    const { performFoodAction } = await import("@/lib/server/foods");

    await performFoodAction({ familyId: "demo", foodId: "food-1", type: "take", quantity: 1 });

    expect(mocks.foodUpdate).toHaveBeenCalledWith({
      where: { id: "food-1" },
      data: { quantity: 1, status: "active", lastActorId: "member-1" },
    });
    expect(mocks.operationCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "member-1",
        familyId: "demo",
        foodId: "food-1",
        type: "take",
      }),
    });
  });
});
