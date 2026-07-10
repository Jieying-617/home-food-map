import { describe, expect, it } from "vitest";
import { buildLocationOverview } from "@/lib/domain/locationOverview";

describe("buildLocationOverview", () => {
  const today = new Date("2026-07-10T00:00:00+08:00");

  it("counts foods, priorities, and the first three inspection route items", () => {
    const overview = buildLocationOverview(
      [
        {
          id: "expired",
          name: "过期柜",
          foods: [{ name: "酸奶", expiresAt: new Date("2026-07-09T00:00:00+08:00") }],
        },
        {
          id: "week",
          name: "一周柜",
          foods: [{ name: "牛奶", expiresAt: new Date("2026-07-17T00:00:00+08:00") }],
        },
        {
          id: "calm",
          name: "安心柜",
          foods: [{ name: "坚果", expiresAt: new Date("2026-08-20T00:00:00+08:00") }],
        },
        {
          id: "later",
          name: "远期柜",
          foods: [{ name: "蜂蜜", expiresAt: new Date("2026-09-01T00:00:00+08:00") }],
        },
        { id: "empty", name: "空柜", foods: [] },
      ],
      today,
    );

    expect(overview).toMatchObject({
      totalFoods: 4,
      priorityCount: 2,
      routeItems: [
        { locationId: "expired", riskLabel: "已过期" },
        { locationId: "week", riskLabel: "7 天内" },
        { locationId: "calm", riskLabel: "很安心" },
      ],
    });
    expect(overview.routeItems).toHaveLength(3);
    expect(overview.routeItems.map((item) => item.locationId)).not.toContain("empty");
  });

  it("keeps the input dates unchanged while applying every risk boundary", () => {
    const expiresAt = new Date("2026-07-10T00:00:00+08:00");
    const todayTime = today.getTime();
    const expiresAtTime = expiresAt.getTime();

    const overview = buildLocationOverview(
      [
        { id: "today", name: "今天柜", foods: [{ name: "豆腐", expiresAt }] },
        {
          id: "month",
          name: "月内柜",
          foods: [{ name: "麦片", expiresAt: new Date("2026-08-09T00:00:00+08:00") }],
        },
        {
          id: "later",
          name: "安心柜",
          foods: [{ name: "蜂蜜", expiresAt: new Date("2026-08-11T00:00:00+08:00") }],
        },
      ],
      today,
    );

    expect(overview.routeItems).toEqual([
      expect.objectContaining({ days: 0, riskLabel: "今天到期" }),
      expect.objectContaining({ days: 30, riskLabel: "30 天内" }),
      expect.objectContaining({ days: 32, riskLabel: "很安心" }),
    ]);
    expect(today.getTime()).toBe(todayTime);
    expect(expiresAt.getTime()).toBe(expiresAtTime);
  });

  it("keeps only the earliest food from each location in the inspection route", () => {
    const overview = buildLocationOverview(
      [
        {
          id: "busy",
          name: "同一个柜子",
          foods: [
            { name: "今天牛奶", expiresAt: new Date("2026-07-10T00:00:00+08:00") },
            { name: "明天酸奶", expiresAt: new Date("2026-07-11T00:00:00+08:00") },
            { name: "后天豆腐", expiresAt: new Date("2026-07-12T00:00:00+08:00") },
          ],
        },
        {
          id: "other",
          name: "另一个柜子",
          foods: [{ name: "面包", expiresAt: new Date("2026-07-13T00:00:00+08:00") }],
        },
      ],
      today,
    );

    expect(overview.totalFoods).toBe(4);
    expect(overview.priorityCount).toBe(4);
    expect(overview.routeItems).toEqual([
      expect.objectContaining({ locationId: "busy", foodName: "今天牛奶" }),
      expect.objectContaining({ locationId: "other", foodName: "面包" }),
    ]);
  });
});
