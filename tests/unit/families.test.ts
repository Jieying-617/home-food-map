import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  memberFindFirst: vi.fn(),
  memberCreate: vi.fn(),
  revalidatePath: vi.fn(),
  setCurrentMemberId: vi.fn(),
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

vi.mock("@/lib/server/currentMember", () => ({
  setCurrentMemberId: mocks.setCurrentMemberId,
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
    expect(mocks.setCurrentMemberId).toHaveBeenCalledWith("member-new");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/f/demo/family");
    expect(result).toEqual({ familyId: "demo", memberId: "member-new" });
  });

  it("uses an existing member as the current member", async () => {
    mocks.memberFindFirst.mockResolvedValue({ id: "member-existing", familyId: "demo", nickname: "auntie", role: "member" });

    const { DEMO_FAMILY_INVITE_CODE } = await import("@/lib/domain/familyInvite");
    const { joinFamilyByInviteCode } = await import("@/lib/server/families");

    const result = await joinFamilyByInviteCode({ inviteCode: DEMO_FAMILY_INVITE_CODE, nickname: "auntie" });

    expect(mocks.memberCreate).not.toHaveBeenCalled();
    expect(mocks.setCurrentMemberId).toHaveBeenCalledWith("member-existing");
    expect(result).toEqual({ familyId: "demo", memberId: "member-existing" });
  });

  it("rejects an incorrect invite code", async () => {
    const { joinFamilyByInviteCode } = await import("@/lib/server/families");

    await expect(joinFamilyByInviteCode({ inviteCode: "wrong", nickname: "阿姨" })).rejects.toThrow("邀请码不正确");
    expect(mocks.memberCreate).not.toHaveBeenCalled();
  });

  it("selects an existing family member as the current member", async () => {
    mocks.memberFindFirst.mockResolvedValue({ id: "member-1" });

    const { selectCurrentFamilyMember } = await import("@/lib/server/families");

    const result = await selectCurrentFamilyMember({ familyId: "demo", memberId: "member-1" });

    expect(mocks.memberFindFirst).toHaveBeenCalledWith({
      where: { id: "member-1", familyId: "demo" },
      select: { id: true },
    });
    expect(mocks.setCurrentMemberId).toHaveBeenCalledWith("member-1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/f/demo/family");
    expect(result).toEqual({ familyId: "demo", memberId: "member-1" });
  });
});
