"use server";

import { revalidatePath } from "next/cache";
import { DEMO_FAMILY_ID, DEMO_FAMILY_INVITE_CODE, normalizeInviteCode } from "@/lib/domain/familyInvite";
import { db } from "@/lib/db";

export type JoinFamilyInput = {
  inviteCode: string;
  nickname: string;
};

export async function getDemoFamily() {
  return db.family.findUniqueOrThrow({
    where: { id: DEMO_FAMILY_ID },
    include: { members: { orderBy: { createdAt: "asc" } } },
  });
}

export async function joinFamilyByInviteCode(input: JoinFamilyInput) {
  const inviteCode = normalizeInviteCode(input.inviteCode);
  const nickname = input.nickname.trim();

  if (!nickname) throw new Error("称呼不能为空");
  if (inviteCode !== DEMO_FAMILY_INVITE_CODE) throw new Error("邀请码不正确");

  const existingMember = await db.member.findFirst({
    where: { familyId: DEMO_FAMILY_ID, nickname },
  });
  if (existingMember) {
    return { familyId: DEMO_FAMILY_ID, memberId: existingMember.id };
  }

  const member = await db.member.create({
    data: { familyId: DEMO_FAMILY_ID, nickname, role: "member" },
  });
  revalidatePath(`/f/${DEMO_FAMILY_ID}/family`);
  return { familyId: DEMO_FAMILY_ID, memberId: member.id };
}
