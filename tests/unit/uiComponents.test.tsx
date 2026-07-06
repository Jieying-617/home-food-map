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
    const { container } = render(
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
    expect(screen.getByRole("button", { name: /消耗\s*1包/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "更多消耗数量" })).toBeVisible();
    expect(screen.getByRole("button", { name: /全部吃完/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /丢弃/ })).toBeVisible();
    expect(container.innerHTML).not.toMatch(/bg-(teal|sky|rose|orange|amber|red)-50/);
    expect(container.innerHTML).not.toMatch(/text-(teal|sky|rose|orange|amber|red)-800/);
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
    expect(screen.getByText("蛋黄派")).toBeVisible();
    expect(screen.getByText(/最近到期：2026\/8\/20/)).toBeVisible();
  });
  it("summarizes cabinet expiry risk with clear priority badges", () => {
    const { container } = render(
      <LocationCard
        familyId="demo"
        today={new Date("2026-07-04T00:00:00+08:00")}
        location={{
          id: "loc-1",
          name: "妈妈零食柜",
          sketchCoverUrl: null,
          photoUrl: null,
          foods: [
            { name: "过期饼干", expiresAt: new Date("2026-07-02T00:00:00+08:00") },
            { name: "今天牛奶", expiresAt: new Date("2026-07-04T00:00:00+08:00") },
            { name: "蛋黄派", expiresAt: new Date("2026-07-08T00:00:00+08:00") },
            { name: "坚果", expiresAt: new Date("2026-07-25T00:00:00+08:00") },
          ],
        }}
      />,
    );

    expect(screen.getByText("已过期 1 件")).toBeVisible();
    expect(screen.getByText("今天到期 1 件")).toBeVisible();
    expect(screen.getByText("7 天内 1 件")).toBeVisible();
    expect(screen.getByText("30 天内 1 件")).toBeVisible();
    expect(screen.getByText("先处理：过期饼干")).toBeVisible();
    expect(container.innerHTML).not.toMatch(/bg-(teal|sky|rose|orange|amber|red)-50/);
    expect(container.innerHTML).not.toMatch(/text-(teal|sky|rose|orange|amber|red)-800/);
  });

  it("shows a calm cabinet status when nothing is urgent", () => {
    render(
      <LocationCard
        familyId="demo"
        today={new Date("2026-07-04T00:00:00+08:00")}
        location={{
          id: "loc-1",
          name: "妈妈零食柜",
          sketchCoverUrl: null,
          photoUrl: null,
          foods: [{ name: "坚果", expiresAt: new Date("2026-09-20T00:00:00+08:00") }],
        }}
      />,
    );

    expect(screen.getByText("暂无急事")).toBeVisible();
    expect(screen.getByText("最早到期：坚果")).toBeVisible();
  });
});

