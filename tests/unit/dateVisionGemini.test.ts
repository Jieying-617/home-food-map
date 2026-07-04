import { describe, expect, it, vi } from "vitest";
import { recognizePackageDateWithGemini } from "@/lib/server/dateVisionGemini";

describe("recognizePackageDateWithGemini", () => {
  it("calls Gemini with inline image data and parses JSON text", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          candidates: [{ content: { parts: [{ text: JSON.stringify({
            productionDate: "2026-01-13",
            expiryDate: "2027-12-31",
            batchNumber: "20260101",
            confidence: "high",
            rawText: "产品批号 20260101 生产日期 20260113 有效期至 2027.12",
            explanation: "有效期只标到年月，按该月最后一天处理。",
          }) }] } }],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await recognizePackageDateWithGemini({
      apiKey: "gemini-key",
      imageBase64: "abc123",
      mimeType: "image/jpeg",
      model: "gemini-test",
      fetchImpl,
    });

    expect(result).toMatchObject({ expiryDate: "2027-12-31", confidence: "high" });
    expect(fetchImpl.mock.calls[0][0]).toBe("https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent");
    expect(fetchImpl.mock.calls[0][1].headers).toEqual(expect.objectContaining({ "X-goog-api-key": "gemini-key" }));
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body as string);
    expect(body.contents[0].parts[1].inlineData).toEqual({ mimeType: "image/jpeg", data: "abc123" });
    expect(body.generationConfig.responseMimeType).toBe("application/json");
  });
});

