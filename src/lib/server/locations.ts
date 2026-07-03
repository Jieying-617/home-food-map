"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type CreateLocationInput = {
  familyId: string;
  name: string;
  photoUrl?: string;
  sketchCoverUrl?: string;
  tags: string[];
};

export async function listLocations(familyId: string) {
  return db.location.findMany({
    where: { familyId },
    include: { foods: { where: { status: "active" }, orderBy: { expiresAt: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createLocation(input: CreateLocationInput) {
  const location = await db.location.create({
    data: {
      familyId: input.familyId,
      name: input.name,
      photoUrl: input.photoUrl,
      sketchCoverUrl: input.sketchCoverUrl,
      tags: JSON.stringify(input.tags),
    },
  });
  revalidatePath(`/f/${input.familyId}/locations`);
  return location;
}
