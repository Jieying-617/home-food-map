import { describe, expect, it, vi } from "vitest";
import { recognizeDateByVision, recognizeDateText } from "@/lib/adapters/ocr";

describe("recognizeDateByVision", () => {
  it("surfaces readable server error details when model recognition fails", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          error: "MODEL_DATE_RECOGNITION_FAILED",
          message: "OpenAI date recognition failed: 429 insufficient_quota",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["image"], "date.jpg", { type: "image/jpeg" });

    await expect(recognizeDateByVision(file)).rejects.toThrow("OpenAI date recognition failed: 429 insufficient_quota");
  });
});

describe("recognizeDateText", () => {
  it("combines OCR text from original and enhanced image variants", async () => {
    const file = new File(["image"], "date.jpg", { type: "image/jpeg" });
    const enhanced = new Blob(["enhanced"], { type: "image/png" });
    const recognizeImpl = vi
      .fn()
      .mockResolvedValueOnce({ data: { text: "team 20260113 03 com casi 2027. 1. -" } })
      .mockResolvedValueOnce({ data: { text: "【有效期】至 2027.12." } });

    const text = await recognizeDateText(file, {
      createInputs: async () => [file, enhanced],
      recognizeImpl,
    });

    expect(text).toContain("team 20260113");
    expect(text).toContain("【有效期】至 2027.12.");
    expect(recognizeImpl).toHaveBeenCalledTimes(2);
  });
});
