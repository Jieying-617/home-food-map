import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CreateLocationForm } from "@/components/location/CreateLocationForm";
import { createLocation } from "@/lib/server/locations";

vi.mock("@/lib/server/locations", () => ({
  createLocation: vi.fn(),
}));

describe("CreateLocationForm", () => {
  it("requires a user-defined location name before saving", async () => {
    render(<CreateLocationForm familyId="demo" />);

    fireEvent.click(screen.getByRole("button", { name: "保存位置" }));

    expect(await screen.findByText("位置名称不能为空")).toBeVisible();
    expect(createLocation).not.toHaveBeenCalled();
  });

  it("saves a named household location with tags", async () => {
    vi.mocked(createLocation).mockResolvedValue({ id: "loc-1" } as never);
    render(<CreateLocationForm familyId="demo" />);

    fireEvent.change(screen.getByLabelText("位置名称"), { target: { value: "妈妈零食柜" } });
    fireEvent.change(screen.getByLabelText("标签"), { target: { value: "常温 零食" } });
    fireEvent.click(screen.getByRole("button", { name: "保存位置" }));

    await waitFor(() => {
      expect(createLocation).toHaveBeenCalledWith({
        familyId: "demo",
        name: "妈妈零食柜",
        tags: ["常温", "零食"],
        photoUrl: undefined,
        sketchCoverUrl: undefined,
      });
    });
    expect(await screen.findByText("位置已保存")).toBeVisible();
  });
});
