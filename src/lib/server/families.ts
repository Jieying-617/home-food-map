"use server";

import { revalidatePath } from "next/cache";
import { DEMO_FAMILY_ID, DEMO_FAMILY_INVITE_CODE, normalizeInviteCode } from "@/lib/domain/familyInvite";
import { db } from "@/lib/db";
import { setCurrentMemberId } from "@/lib/server/currentMember";

export type JoinFamilyInput = {
  inviteCode: string;
  nickname: string;
};

export type SelectCurrentMemberInput = {
  familyId: string;
  memberId: string;
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
    await setCurrentMemberId(existingMember.id);
    return { familyId: DEMO_FAMILY_ID, memberId: existingMember.id };
  }

  const member = await db.member.create({
    data: { familyId: DEMO_FAMILY_ID, nickname, role: "member" },
  });
  await setCurrentMemberId(member.id);
  revalidatePath(`/f/${DEMO_FAMILY_ID}/family`);
  return { familyId: DEMO_FAMILY_ID, memberId: member.id };
}

export async function selectCurrentFamilyMember(input: SelectCurrentMemberInput) {
  const member = await db.member.findFirst({
    where: { id: input.memberId, familyId: input.familyId },
    select: { id: true },
  });
  if (!member) throw new Error("成员不存在");

  await setCurrentMemberId(member.id);
  revalidatePath(`/f/${input.familyId}/family`);
  return { familyId: input.familyId, memberId: member.id };
}
