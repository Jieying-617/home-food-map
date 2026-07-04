import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/dateVision", () => ({
  recognizePackageDateWithVision: vi.fn(async () => {
    throw new Error("OpenAI date recognition failed: connect timeout");
  }),
}));

describe("POST /api/recognize-date", () => {
  it("returns a readable JSON error when model recognition fails", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const { POST } = await import("@/app/api/recognize-date/route");
    const form = new FormData();
    form.append("file", new File(["image"], "date.jpg", { type: "image/jpeg" }));

    const response = await POST(new Request("http://localhost/api/recognize-date", { method: "POST", body: form }));

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "MODEL_DATE_RECOGNITION_FAILED",
      message: "OpenAI date recognition failed: connect timeout",
    });
  });
});