import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddFoodConfirmForm } from "@/components/add/AddFoodConfirmForm";
import { createFood } from "@/lib/server/foods";

vi.mock("@/lib/server/foods", () => ({
  createFood: vi.fn(),
}));

describe("AddFoodConfirmForm", () => {
  beforeEach(() => {
    vi.mocked(createFood).mockReset();
  });

  it("blocks saving recognized drafts until required fields are confirmed", async () => {
    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "蛋黄派", quantity: 3, unit: "包", locationId: "", expiresAt: "", source: "voice" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));

    expect(await screen.findByText("名称、位置、到期日都确认后才能保存。")).toBeVisible();
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
    expect(await screen.findByText("已保存到库存。")).toBeVisible();
  });

  it("offers clear next steps after saving a food", async () => {
    vi.mocked(createFood).mockResolvedValue({ id: "food-1" } as never);

    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "海苔卷", quantity: 2, unit: "包", locationId: "loc-1", expiresAt: "2026-07-20", source: "manual" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));

    expect(await screen.findByText("已保存到库存。")).toBeVisible();
    expect(screen.getByRole("button", { name: "继续添加同位置" })).toBeVisible();
    expect(screen.getByRole("link", { name: "查看这个位置" })).toHaveAttribute("href", "/f/demo/locations/loc-1");
  });

  it("keeps the saved location while clearing fields for the next food", async () => {
    vi.mocked(createFood).mockResolvedValue({ id: "food-1" } as never);

    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "海苔卷", quantity: 2, unit: "包", locationId: "loc-1", expiresAt: "2026-07-20", source: "manual" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));
    await screen.findByText("已保存到库存。");
    fireEvent.click(screen.getByRole("button", { name: "继续添加同位置" }));

    expect(screen.getByLabelText("存放位置")).toHaveValue("loc-1");
    expect(screen.getByLabelText("到期日")).toHaveValue("");
    expect(screen.getByDisplayValue("件")).toBeVisible();
    expect(screen.queryByDisplayValue("海苔卷")).not.toBeInTheDocument();
  });

  it("explains recognized drafts before saving", () => {
    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "酸奶", quantity: 2, unit: "盒", locationId: "loc-1", expiresAt: "2026-07-20", source: "date-photo" }}
      />,
    );

    expect(screen.getByText("拍照识别结果，请确认后保存")).toBeVisible();
    expect(screen.getByText("名称、数量、位置和到期日都可以手动修改。")).toBeVisible();
  });

  it("shows field-level errors for missing required fields", async () => {
    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "", quantity: 1, unit: "件", locationId: "", expiresAt: "", source: "manual" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));

    expect(await screen.findByText("请填写食物名称。")).toBeVisible();
    expect(screen.getByText("请选择存放位置。")).toBeVisible();
    expect(screen.getByText("请选择到期日。")).toBeVisible();
    expect(createFood).not.toHaveBeenCalled();
  });

  it("lets the user choose a common unit with one tap", () => {
    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "酸奶", quantity: 2, unit: "件", locationId: "loc-1", expiresAt: "2026-07-20", source: "manual" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "盒" }));

    expect(screen.getByLabelText("单位")).toHaveValue("盒");
  });

  it("offers a shortcut back to the reminder dashboard after saving", async () => {
    vi.mocked(createFood).mockResolvedValue({ id: "food-1" } as never);

    render(
      <AddFoodConfirmForm
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        draft={{ name: "酸奶", quantity: 2, unit: "盒", locationId: "loc-1", expiresAt: "2026-07-20", source: "manual" }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "确认保存" }));

    expect(await screen.findByRole("link", { name: "回提醒首页" })).toHaveAttribute("href", "/f/demo");
  });
});
