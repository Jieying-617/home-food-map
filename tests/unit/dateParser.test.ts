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

  it("uses the latest complete OCR date candidate when labels are garbled", () => {
    expect(parsePackageDate("team 20260113 03 com casi 2027. 12. -", new Date("2026-07-03"))).toEqual({
      expiresAt: "2027-12-31",
      confidence: "medium",
      source: "ocr-expiry-candidate",
    });
  });

  it("does not trust a noisy one-digit month candidate without a readable expiry label", () => {
    expect(parsePackageDate("team 20260113 03 com casi 2027. 1. -", new Date("2026-07-03"))).toEqual({
      expiresAt: "2026-07-03",
      confidence: "low",
      source: "unknown",
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
