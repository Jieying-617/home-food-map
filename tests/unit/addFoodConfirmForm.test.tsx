import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddFoodConfirmForm } from "@/components/add/AddFoodConfirmForm";
import { createFood } from "@/lib/server/foods";

vi.mock("@/lib/server/foods", () => ({
  createFood: vi.fn(),
}));

describe("AddFoodConfirmForm", () => {
  it("blocks saving recognized drafts until required fields are confirmed", async () => {
    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "蛋黄派", quantity: 3, unit: "包", locationId: "", expiresAt: "", source: "voice" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));

    expect(await screen.findByText("名称、位置、到期日都要确认后才能保存")).toBeVisible();
    expect(createFood).not.toHaveBeenCalled();
  });

  it("saves the edited confirmation fields", async () => {
    vi.mocked(createFood).mockResolvedValue({ id: "food-1" } as never);

    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "蛋黄派", quantity: 3, unit: "包", locationId: "", expiresAt: "", source: "voice" }}
      />,
    );

    fireEvent.change(screen.getByLabelText("存放位置"), { target: { value: "loc-1" } });
    fireEvent.change(screen.getByLabelText("到期日"), { target: { value: "2026-08-20" } });
    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));

    await waitFor(() => {
      expect(createFood).toHaveBeenCalledWith({
        familyId: "demo",
        name: "蛋黄派",
        quantity: 3,
        unit: "包",
        locationId: "loc-1",
        expiresAt: "2026-08-20",
        source: "voice",
      });
    });
    expect(await screen.findByText("已保存")).toBeVisible();
  });
});
