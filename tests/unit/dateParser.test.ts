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

  it("uses explicit expiry month from package dot format", () => {
    expect(parsePackageDate("【产品批号】20260101 【生产日期】20260113 030 【有效期】至 2027.12.", new Date("2026-07-03"))).toEqual({
      expiresAt: "2027-12-31",
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

  it("calculates expiry from compact production date and shelf life in months", () => {
    expect(parsePackageDate("生产日期 20260113 保质期12个月", new Date("2026-07-03"))).toEqual({
      expiresAt: "2027-01-13",
      confidence: "medium",
      source: "production-plus-shelf-life",
    });
  });
});
