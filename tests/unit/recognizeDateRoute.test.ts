import { beforeEach, describe, expect, it, vi } from "vitest";

const openRouterMock = vi.hoisted(() => vi.fn());
const geminiMock = vi.hoisted(() => vi.fn());
const openaiMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/dateVisionOpenRouter", () => ({
  recognizePackageDateWithOpenRouter: openRouterMock,
}));
vi.mock("@/lib/server/dateVisionGemini", () => ({
  recognizePackageDateWithGemini: geminiMock,
}));
vi.mock("@/lib/server/dateVision", () => ({
  recognizePackageDateWithVision: openaiMock,
}));

describe("POST /api/recognize-date", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    openRouterMock.mockReset();
    geminiMock.mockReset();
    openaiMock.mockReset();
  });

  it("uses Gemini first when Gemini and OpenRouter are both configured", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "openrouter-key");
    vi.stubEnv("GEMINI_API_KEY", "gemini-key");
    geminiMock.mockResolvedValue({ productionDate: null, expiryDate: "2027-12-31", batchNumber: null, confidence: "high", rawText: "有效期至 2027.12", explanation: "Gemini 识别" });
    const { POST } = await import("@/app/api/recognize-date/route");
    const form = new FormData();
    form.append("file", new File(["image"], "date.jpg", { type: "image/jpeg" }));
    const response = await POST(new Request("http://localhost/api/recognize-date", { method: "POST", body: form }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ expiryDate: "2027-12-31" });
    expect(geminiMock).toHaveBeenCalled();
    expect(openRouterMock).not.toHaveBeenCalled();
    expect(openaiMock).not.toHaveBeenCalled();
  });

  it("falls back from Gemini to OpenRouter, then skips OpenAI after OpenRouter succeeds", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "openrouter-key");
    vi.stubEnv("GEMINI_API_KEY", "gemini-key");
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    geminiMock.mockRejectedValue(new Error("Gemini date recognition failed: 503 unavailable"));
    openRouterMock.mockResolvedValue({ productionDate: null, expiryDate: "2027-12-31", batchNumber: null, confidence: "medium", rawText: "有效期至 2027.12", explanation: "OpenRouter fallback" });
    const { POST } = await import("@/app/api/recognize-date/route");
    const form = new FormData();
    form.append("file", new File(["image"], "date.jpg", { type: "image/jpeg" }));
    const response = await POST(new Request("http://localhost/api/recognize-date", { method: "POST", body: form }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ expiryDate: "2027-12-31" });
    expect(openRouterMock).toHaveBeenCalled();
    expect(openaiMock).not.toHaveBeenCalled();
  });

  it("falls back to OpenAI when free providers fail and OpenAI is configured", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "openrouter-key");
    vi.stubEnv("GEMINI_API_KEY", "gemini-key");
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    geminiMock.mockRejectedValue(new Error("Gemini date recognition failed: 503 unavailable"));
    openRouterMock.mockRejectedValue(new Error("OpenRouter date recognition failed: 429 rate limit"));
    openaiMock.mockResolvedValue({ productionDate: null, expiryDate: "2027-12-31", batchNumber: null, confidence: "medium", rawText: "有效期至 2027.12", explanation: "OpenAI fallback" });
    const { POST } = await import("@/app/api/recognize-date/route");
    const form = new FormData();
    form.append("file", new File(["image"], "date.jpg", { type: "image/jpeg" }));
    const response = await POST(new Request("http://localhost/api/recognize-date", { method: "POST", body: form }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ expiryDate: "2027-12-31" });
    expect(openaiMock).toHaveBeenCalled();
  });

  it("returns a readable JSON error when all configured model recognition fails", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    openaiMock.mockRejectedValue(new Error("OpenAI date recognition failed: connect timeout"));
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
