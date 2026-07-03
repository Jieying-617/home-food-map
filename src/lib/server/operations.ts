"use server";

import { db } from "@/lib/db";

export async function listOperations(familyId: string) {
  return db.operation.findMany({
    where: { familyId },
    include: { food: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
