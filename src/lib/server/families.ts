"use server";

import { db } from "@/lib/db";

export async function getDemoFamily() {
  return db.family.findUniqueOrThrow({
    where: { id: "demo" },
    include: { members: true },
  });
}
