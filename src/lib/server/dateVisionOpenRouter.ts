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

type RecognizePackageDateWithOpenRouterInput = {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
  model?: string;
  proxyUrl?: string | null;
  proxyAgentFactory?: (proxyUrl: string) => unknown;
  fetchImpl?: FetchWithDispatcher;
};

function readOpenRouterText(response: unknown): string {
  if (typeof response !== "object" || response === null) return "";
  const data = response as { choices?: Array<{ message?: { content?: unknown } }> };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    for (const part of content) {
      if (typeof part === "object" && part !== null && typeof (part as { text?: unknown }).text === "string") {
        return (part as { text: string }).text;
      }
    }
  }
  return "";
}

export async function recognizePackageDateWithOpenRouter({
  apiKey,
  imageBase64,
  mimeType,
  model = process.env.OPENROUTER_DATE_MODEL ?? "google/gemma-4-31b-it:free",
  proxyUrl = process.env.OPENROUTER_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY,
  proxyAgentFactory = (url: string) => new ProxyAgent(url),
  fetchImpl = fetch,
}: RecognizePackageDateWithOpenRouterInput): Promise<VisionDateResult> {
  const requestInit: RequestInit & { dispatcher?: unknown } = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "请识别这张食品包装图片中的生产日期、有效期/到期日、产品批号。只返回 JSON，不要使用 Markdown。JSON 字段必须是 productionDate、expiryDate、batchNumber、confidence、rawText、explanation。日期用 YYYY-MM-DD；若有效期只写到年月，例如 2027.12，则 expiryDate 取该月最后一天；若看不清，不要猜，返回 null 并降低 confidence。" },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
          ],
        },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    }),
  };

  const configuredProxyUrl = normalizeProxyUrl(proxyUrl);
  if (configuredProxyUrl) requestInit.dispatcher = proxyAgentFactory(configuredProxyUrl);

  const response = await fetchImpl("https://openrouter.ai/api/v1/chat/completions", requestInit);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenRouter date recognition failed: ${response.status} ${detail}`.trim());
  }

  const json = await response.json();
  const outputText = readOpenRouterText(json);
  if (!outputText) throw new Error("OpenRouter date recognition returned no text");
  return normalizeVisionDateResult(JSON.parse(cleanJsonText(outputText)));
}
