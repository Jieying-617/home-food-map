import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  memberFindFirst: vi.fn(),
  memberCreate: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    member: {
      findFirst: mocks.memberFindFirst,
      create: mocks.memberCreate,
    },
    family: {
      findUniqueOrThrow: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

describe("joinFamilyByInviteCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.memberFindFirst.mockResolvedValue(null);
    mocks.memberCreate.mockResolvedValue({ id: "member-new", familyId: "demo", nickname: "阿姨", role: "member" });
  });

  it("creates a demo family member from a valid invite code", async () => {
    const { DEMO_FAMILY_INVITE_CODE } = await import("@/lib/domain/familyInvite");
    const { joinFamilyByInviteCode } = await import("@/lib/server/families");

    const result = await joinFamilyByInviteCode({ inviteCode: ` ${DEMO_FAMILY_INVITE_CODE.toLowerCase()} `, nickname: " 阿姨 " });

    expect(mocks.memberCreate).toHaveBeenCalledWith({
      data: { familyId: "demo", nickname: "阿姨", role: "member" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/f/demo/family");
    expect(result).toEqual({ familyId: "demo", memberId: "member-new" });
  });

  it("rejects an incorrect invite code", async () => {
    const { joinFamilyByInviteCode } = await import("@/lib/server/families");

    await expect(joinFamilyByInviteCode({ inviteCode: "wrong", nickname: "阿姨" })).rejects.toThrow("邀请码不正确");
    expect(mocks.memberCreate).not.toHaveBeenCalled();
  });
});
