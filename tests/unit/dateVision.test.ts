import { describe, expect, it, vi } from "vitest";
import { normalizeVisionDateResult, recognizePackageDateWithVision } from "@/lib/server/dateVision";

describe("normalizeVisionDateResult", () => {
  it("normalizes a reliable model result", () => {
    expect(
      normalizeVisionDateResult({
        productionDate: "2026-01-13",
        expiryDate: "2027-12-31",
        batchNumber: "20260101",
        confidence: "high",
        rawText: "有效期至 2027.12",
        explanation: "有效期只到月份，按月末处理",
      }),
    ).toEqual({
      productionDate: "2026-01-13",
      expiryDate: "2027-12-31",
      batchNumber: "20260101",
      confidence: "high",
      rawText: "有效期至 2027.12",
      explanation: "有效期只到月份，按月末处理",
    });
  });

  it("downgrades invalid dates to low confidence", () => {
    expect(
      normalizeVisionDateResult({
        productionDate: "2026-99-99",
        expiryDate: "not a date",
        confidence: "high",
      }),
    ).toMatchObject({ expiryDate: null, productionDate: null, confidence: "low" });
  });
});

describe("recognizePackageDateWithVision", () => {
  it("calls the Responses API with image input and parses structured JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            productionDate: "2026-01-13",
            expiryDate: "2027-12-31",
            batchNumber: "20260101",
            confidence: "high",
            rawText: "产品批号 20260101 生产日期 20260113 有效期至 2027.12",
            explanation: "有效期只标到年月，按该月最后一天处理。",
          }),
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await recognizePackageDateWithVision({
      apiKey: "test-key",
      imageBase64: "abc123",
      mimeType: "image/jpeg",
      fetchImpl,
      model: "test-model",
    });

    expect(result).toMatchObject({ expiryDate: "2027-12-31", confidence: "high" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.openai.com/v1/responses",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer test-key" }),
      }),
    );
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body as string);
    expect(body.model).toBe("test-model");
    expect(JSON.stringify(body.input)).toContain("data:image/jpeg;base64,abc123");
    expect(body.text.format.type).toBe("json_schema");
  });
  it("passes a proxy dispatcher to fetch when proxyUrl is provided", async () => {
    const dispatcher = { kind: "proxy-dispatcher" };
    const proxyAgentFactory = vi.fn().mockReturnValue(dispatcher);
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          output_text: JSON.stringify({
            productionDate: null,
            expiryDate: "2027-12-31",
            batchNumber: null,
            confidence: "medium",
            rawText: "有效期至 2027.12",
            explanation: "有效期只标到年月，按月末处理。",
          }),
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    await recognizePackageDateWithVision({
      apiKey: "test-key",
      imageBase64: "abc123",
      mimeType: "image/jpeg",
      fetchImpl,
      proxyUrl: "http://127.0.0.1:7897",
      proxyAgentFactory,
    });

    expect(proxyAgentFactory).toHaveBeenCalledWith("http://127.0.0.1:7897");
    expect(fetchImpl.mock.calls[0][1]).toEqual(expect.objectContaining({ dispatcher }));
  });
});
