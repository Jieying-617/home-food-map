import { describe, expect, it, vi } from "vitest";
import { recognizeDateByVision } from "@/lib/adapters/ocr";

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
