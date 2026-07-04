import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JoinFamilyForm } from "@/components/family/JoinFamilyForm";
import { joinFamilyByInviteCode } from "@/lib/server/families";

vi.mock("@/lib/server/families", () => ({
  joinFamilyByInviteCode: vi.fn(),
}));

describe("JoinFamilyForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("joins a family with invite code and nickname", async () => {
    vi.mocked(joinFamilyByInviteCode).mockResolvedValue({ familyId: "demo", memberId: "member-new" });

    render(<JoinFamilyForm />);

    fireEvent.change(screen.getByLabelText("邀请码"), { target: { value: "WOJIA" } });
    fireEvent.change(screen.getByLabelText("我的称呼"), { target: { value: "阿姨" } });
    fireEvent.click(screen.getByRole("button", { name: "加入家庭" }));

    await waitFor(() => {
      expect(joinFamilyByInviteCode).toHaveBeenCalledWith({ inviteCode: "WOJIA", nickname: "阿姨" });
    });
    expect(await screen.findByText("加入成功。")).toBeVisible();
    expect(screen.getByRole("link", { name: "进入我们家" })).toHaveAttribute("href", "/f/demo/family");
  });

  it("shows validation errors without calling the server", async () => {
    render(<JoinFamilyForm />);

    fireEvent.click(screen.getByRole("button", { name: "加入家庭" }));

    expect(await screen.findByText("邀请码和称呼都要填写。")).toBeVisible();
    expect(joinFamilyByInviteCode).not.toHaveBeenCalled();
  });
});
