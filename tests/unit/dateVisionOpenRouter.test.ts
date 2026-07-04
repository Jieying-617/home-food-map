import { describe, expect, it, vi } from "vitest";
import { recognizePackageDateWithOpenRouter } from "@/lib/server/dateVisionOpenRouter";

describe("recognizePackageDateWithOpenRouter", () => {
  it("calls OpenRouter with image data URL and parses JSON content", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  productionDate: "2026-01-13",
                  expiryDate: "2027-12-31",
                  batchNumber: "20260101",
                  confidence: "high",
                  rawText: "产品批号 20260101 生产日期 20260113 有效期至 2027.12",
                  explanation: "有效期只标到年月，按该月最后一天处理。",
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await recognizePackageDateWithOpenRouter({
      apiKey: "openrouter-key",
      imageBase64: "abc123",
      mimeType: "image/jpeg",
      model: "google/gemma-4-31b-it:free",
      fetchImpl,
    });

    expect(result).toMatchObject({ expiryDate: "2027-12-31", confidence: "high" });
    expect(fetchImpl.mock.calls[0][0]).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect(fetchImpl.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer openrouter-key" }),
      }),
    );
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body as string);
    expect(body.model).toBe("google/gemma-4-31b-it:free");
    expect(body.messages[0].content[1].image_url.url).toBe("data:image/jpeg;base64,abc123");
  });

  it("passes a proxy dispatcher to fetch when proxyUrl is provided", async () => {
    const dispatcher = { kind: "proxy-dispatcher" };
    const proxyAgentFactory = vi.fn().mockReturnValue(dispatcher);
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: "{\"productionDate\":null,\"expiryDate\":\"2027-12-31\",\"batchNumber\":null,\"confidence\":\"medium\",\"rawText\":\"有效期至 2027.12\",\"explanation\":\"按月末处理\"}" } }] }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    await recognizePackageDateWithOpenRouter({
      apiKey: "openrouter-key",
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
