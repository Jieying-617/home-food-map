"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { applyInventoryAction, type InventoryFood } from "@/lib/domain/inventory";

export type CreateFoodInput = {
  familyId: string;
  locationId: string;
  name: string;
  quantity: number;
  unit: string;
  expiresAt: string;
  datePhotoUrl?: string;
  source: "manual" | "voice" | "date-photo";
};

export async function listFoods(familyId: string, filters?: { locationId?: string; status?: string }) {
  return db.food.findMany({
    where: {
      familyId,
      locationId: filters?.locationId,
      status: filters?.status ?? "active",
    },
    include: { location: true },
    orderBy: { expiresAt: "asc" },
  });
}

export async function createFood(input: CreateFoodInput) {
  if (!input.locationId) throw new Error("必须选择存放位置");
  if (!input.expiresAt) throw new Error("必须填写到期日");

  const food = await db.food.create({
    data: {
      familyId: input.familyId,
      locationId: input.locationId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      expiresAt: new Date(input.expiresAt),
      datePhotoUrl: input.datePhotoUrl,
      source: input.source,
    },
  });
  await db.operation.create({
    data: { familyId: input.familyId, foodId: food.id, type: "create", after: JSON.stringify(food) },
  });
  revalidatePath(`/f/${input.familyId}`);
  return food;
}

export async function performFoodAction(input: { familyId: string; foodId: string; type: "take" | "finish" | "discard"; quantity?: number }) {
  const food = await db.food.findUniqueOrThrow({ where: { id: input.foodId } });
  const current: InventoryFood = {
    id: food.id,
    name: food.name,
    quantity: food.quantity,
    unit: food.unit,
    status: food.status as InventoryFood["status"],
  };
  const next = applyInventoryAction(
    current,
    input.type === "take" ? { type: "take", quantity: input.quantity ?? 1 } : { type: input.type },
  );
  const updated = await db.food.update({
    where: { id: food.id },
    data: { quantity: next.quantity, status: next.status },
  });
  await db.operation.create({
    data: {
      familyId: input.familyId,
      foodId: food.id,
      type: input.type,
      before: JSON.stringify(food),
      after: JSON.stringify(updated),
    },
  });
  revalidatePath(`/f/${input.familyId}`);
  return updated;
}
