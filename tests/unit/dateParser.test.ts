import { describe, expect, it } from "vitest";
import { parsePackageDate } from "@/lib/domain/dateParser";

describe("parsePackageDate", () => {
  it("uses explicit expiry date when present", () => {
    expect(parsePackageDate("有效期至2026年8月20日", new Date("2026-07-03"))).toEqual({
      expiresAt: "2026-08-20",
      confidence: "high",
      source: "explicit-expiry",
    });
  });

  it("calculates expiry from production date and shelf life in months", () => {
    expect(parsePackageDate("生产日期2026年1月1日 保质期12个月", new Date("2026-07-03"))).toEqual({
      expiresAt: "2027-01-01",
      confidence: "medium",
      source: "production-plus-shelf-life",
    });
  });
});
