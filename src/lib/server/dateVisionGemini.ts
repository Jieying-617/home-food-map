import { ProxyAgent } from "undici";
import { normalizeVisionDateResult, type VisionDateResult } from "./dateVision";

type FetchWithDispatcher = (url: string, init: RequestInit & { dispatcher?: unknown }) => Promise<Response>;

function normalizeProxyUrl(proxyUrl?: string | null): string | null {
  const trimmed = proxyUrl?.trim();
  return trimmed ? trimmed : null;
}

function cleanJsonText(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

type RecognizePackageDateWithGeminiInput = {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
  model?: string;
  proxyUrl?: string | null;
  proxyAgentFactory?: (proxyUrl: string) => unknown;
  fetchImpl?: FetchWithDispatcher;
};

function readGeminiText(response: unknown): string {
  if (typeof response !== "object" || response === null) return "";
  const data = response as { candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }> };
  for (const candidate of data.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (typeof part.text === "string") return part.text;
    }
  }
  return "";
}

export async function recognizePackageDateWithGemini({
  apiKey,
  imageBase64,
  mimeType,
  model = process.env.GEMINI_DATE_MODEL ?? "gemini-2.5-flash",
  proxyUrl = process.env.GEMINI_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY,
  proxyAgentFactory = (url: string) => new ProxyAgent(url),
  fetchImpl = fetch,
}: RecognizePackageDateWithGeminiInput): Promise<VisionDateResult> {
  const requestInit: RequestInit & { dispatcher?: unknown } = {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            { text: "请识别这张食品包装图片中的生产日期、有效期/到期日、产品批号。只返回 JSON，不要使用 Markdown。JSON 字段必须是 productionDate、expiryDate、batchNumber、confidence、rawText、explanation。日期用 YYYY-MM-DD；若有效期只写到年月，例如 2027.12，则 expiryDate 取该月最后一天；若看不清，不要猜，返回 null 并降低 confidence。" },
            { inlineData: { mimeType, data: imageBase64 } },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    }),
  };

  const configuredProxyUrl = normalizeProxyUrl(proxyUrl);
  if (configuredProxyUrl) requestInit.dispatcher = proxyAgentFactory(configuredProxyUrl);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const response = await fetchImpl(url, requestInit);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Gemini date recognition failed: ${response.status} ${detail}`.trim());
  }

  const json = await response.json();
  const outputText = readGeminiText(json);
  if (!outputText) throw new Error("Gemini date recognition returned no text");
  return normalizeVisionDateResult(JSON.parse(cleanJsonText(outputText)));
}

