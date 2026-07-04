"use server";

import { db } from "@/lib/db";

export async function listOperations(familyId: string) {
  const operations = await db.operation.findMany({
    where: { familyId },
    include: { food: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const actorIds = Array.from(new Set(operations.map((operation) => operation.actorId).filter((actorId): actorId is string => Boolean(actorId))));

  const members = actorIds.length
    ? await db.member.findMany({
        where: { familyId, id: { in: actorIds } },
        select: { id: true, nickname: true },
      })
    : [];
  const membersById = new Map(members.map((member) => [member.id, member]));

  return operations.map((operation) => ({
    ...operation,
    actor: operation.actorId ? membersById.get(operation.actorId) ?? null : null,
  }));
}
