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

export type UpdateLocationCoverInput = {
  familyId: string;
  locationId: string;
  photoUrl: string;
  sketchCoverUrl?: string;
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

export async function updateLocationCover(input: UpdateLocationCoverInput) {
  const location = await db.location.findFirst({
    where: { id: input.locationId, familyId: input.familyId },
    select: { id: true },
  });
  if (!location) throw new Error("位置不存在");

  const updated = await db.location.update({
    where: { id: input.locationId },
    data: {
      photoUrl: input.photoUrl,
      sketchCoverUrl: input.sketchCoverUrl,
    },
  });

  revalidatePath(`/f/${input.familyId}/locations`);
  revalidatePath(`/f/${input.familyId}/locations/${input.locationId}`);
  return updated;
}
