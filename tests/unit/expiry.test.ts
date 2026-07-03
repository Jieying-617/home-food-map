import { describe, expect, it } from "vitest";
import { groupExpiry } from "@/lib/domain/expiry";

describe("groupExpiry", () => {
  it("groups active foods by urgency and ignores resolved foods", () => {
    const grouped = groupExpiry(
      [
        { id: "a", name: "牛奶", expiresAt: "2026-07-03", status: "active", locationId: "l1", quantity: 1, unit: "盒" },
        { id: "b", name: "蛋黄派", expiresAt: "2026-07-06", status: "active", locationId: "l2", quantity: 3, unit: "包" },
        { id: "c", name: "坚果", expiresAt: "2026-08-01", status: "active", locationId: "l2", quantity: 1, unit: "袋" },
        { id: "d", name: "饼干", expiresAt: "2026-07-01", status: "discarded", locationId: "l3", quantity: 1, unit: "盒" },
      ],
      new Date("2026-07-03T00:00:00+08:00"),
    );

    expect(grouped.today.map((item) => item.name)).toEqual(["牛奶"]);
    expect(grouped.within3Days.map((item) => item.name)).toEqual(["蛋黄派"]);
    expect(grouped.within30Days.map((item) => item.name)).toEqual(["坚果"]);
    expect(grouped.expired).toEqual([]);
  });
});
