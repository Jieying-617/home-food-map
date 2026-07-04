import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const CURRENT_MEMBER_COOKIE = "home_food_map_member_id";

export async function setCurrentMemberId(memberId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CURRENT_MEMBER_COOKIE, memberId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
    sameSite: "lax",
  });
}

export async function getCurrentMemberId(familyId: string) {
  const cookieStore = await cookies();
  const memberId = cookieStore.get(CURRENT_MEMBER_COOKIE)?.value;
  if (!memberId) return null;

  const member = await db.member.findFirst({
    where: { id: memberId, familyId },
    select: { id: true },
  });

  return member?.id ?? null;
}

export async function getCurrentMember(familyId: string) {
  const cookieStore = await cookies();
  const memberId = cookieStore.get(CURRENT_MEMBER_COOKIE)?.value;
  if (!memberId) return null;

  return db.member.findFirst({
    where: { id: memberId, familyId },
    select: { id: true, nickname: true, role: true },
  });
}
