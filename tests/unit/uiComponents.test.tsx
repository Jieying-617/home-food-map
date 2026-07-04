import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
import { LocationCard } from "@/components/location/LocationCard";

vi.mock("@/lib/server/foods", () => ({
  performFoodAction: vi.fn(),
}));

describe("Task 4 inventory UI components", () => {
  it("renders the mobile bottom navigation for a family", () => {
    render(<BottomNav familyId="demo" />);

    expect(screen.getByRole("link", { name: /提醒/ })).toHaveAttribute("href", "/f/demo");
    expect(screen.getByRole("link", { name: /位置/ })).toHaveAttribute("href", "/f/demo/locations");
    expect(screen.getByRole("link", { name: /添加/ })).toHaveAttribute("href", "/f/demo/add");
    expect(screen.getByRole("link", { name: /记录/ })).toHaveAttribute("href", "/f/demo/records");
    expect(screen.getByRole("link", { name: /家庭/ })).toHaveAttribute("href", "/f/demo/family");
  });

  it("shows food details, expiry notice, and one-tap action buttons", () => {
    render(
      <FoodCard
        familyId="demo"
        today={new Date("2026-07-04T00:00:00+08:00")}
        food={{
          id: "food-1",
          name: "蛋黄派",
          quantity: 3,
          unit: "包",
          expiresAt: new Date("2026-07-06T00:00:00+08:00"),
          location: { name: "妈妈零食柜" },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "蛋黄派" })).toBeVisible();
    expect(screen.getByText(/3包/)).toBeVisible();
    expect(screen.getByText(/妈妈零食柜/)).toBeVisible();
    expect(screen.getByText(/2026-07-06/)).toBeVisible();
    expect(screen.getByText("还有 2 天")).toBeVisible();
    expect(screen.getByRole("button", { name: /消耗1包/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /全部消耗/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /全部丢弃/ })).toBeVisible();
  });

  it("links a location card to its detail page and summarizes active foods", () => {
    render(
      <LocationCard
        familyId="demo"
        location={{
          id: "loc-1",
          name: "妈妈零食柜",
          sketchCoverUrl: null,
          photoUrl: null,
          foods: [{ name: "蛋黄派", expiresAt: new Date("2026-08-20T00:00:00+08:00") }],
        }}
      />,
    );

    expect(screen.getByRole("link", { name: /妈妈零食柜/ })).toHaveAttribute("href", "/f/demo/locations/loc-1");
    expect(screen.getByText("1 件在库")).toBeVisible();
    expect(screen.getByText(/最近到期：蛋黄派/)).toBeVisible();
  });
});
