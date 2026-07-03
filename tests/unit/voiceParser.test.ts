import { describe, expect, it } from "vitest";
import { parseVoiceEntry } from "@/lib/domain/voiceParser";

describe("parseVoiceEntry", () => {
  it("extracts location, quantity, unit, name, and date from Chinese voice text", () => {
    const parsed = parseVoiceEntry("零食柜有三包蛋黄派，8月20号到期", ["零食柜", "阳台囤货箱"], new Date("2026-07-03"));
    expect(parsed).toEqual({
      name: "蛋黄派",
      quantity: 3,
      unit: "包",
      locationName: "零食柜",
      expiresAt: "2026-08-20",
      missing: [],
    });
  });
});
