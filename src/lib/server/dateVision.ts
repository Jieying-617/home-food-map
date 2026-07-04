export type VisionDateConfidence = "high" | "medium" | "low";

export type VisionDateResult = {
  productionDate: string | null;
  expiryDate: string | null;
  batchNumber: string | null;
  confidence: VisionDateConfidence;
  rawText: string;
  explanation: string;
};

type RecognizePackageDateInput = {
  apiKey: string;
  imageBase64: string;
  mimeType: string;
  model?: string;
  fetchImpl?: typeof fetch;
};

const schema = {
  name: "package_date_recognition",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      productionDate: { type: ["string", "null"], description: "生产日期，YYYY-MM-DD；没有看清则为 null" },
      expiryDate: { type: ["string", "null"], description: "到期日，YYYY-MM-DD；只看到年月时取该月最后一天；没有看清则为 null" },
      batchNumber: { type: ["string", "null"], description: "产品批号；没有看清则为 null" },
      confidence: { type: "string", enum: ["high", "medium", "low"] },
      rawText: { type: "string", description: "图片中和日期相关的原始文字，不确定也要尽量摘录" },
      explanation: { type: "string", description: "简短说明识别依据和不确定点" },
    },
    required: ["productionDate", "expiryDate", "batchNumber", "confidence", "rawText", "explanation"],
  },
};

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function readOutputText(response: unknown): string {
  if (typeof response !== "object" || response === null) return "";
  const maybe = response as { output_text?: unknown; output?: Array<{ content?: Array<{ text?: unknown }> }> };
  if (typeof maybe.output_text === "string") return maybe.output_text;

  for (const output of maybe.output ?? []) {
    for (const content of output.content ?? []) {
      if (typeof content.text === "string") return content.text;
    }
  }
  return "";
}

export function normalizeVisionDateResult(value: unknown): VisionDateResult {
  const data = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const productionDate = isIsoDate(data.productionDate) ? data.productionDate : null;
  const expiryDate = isIsoDate(data.expiryDate) ? data.expiryDate : null;
  const confidence = data.confidence === "high" || data.confidence === "medium" || data.confidence === "low" ? data.confidence : "low";
  return {
    productionDate,
    expiryDate,
    batchNumber: typeof data.batchNumber === "string" && data.batchNumber.trim() ? data.batchNumber.trim() : null,
    confidence: productionDate || expiryDate ? confidence : "low",
    rawText: typeof data.rawText === "string" ? data.rawText : "",
    explanation: typeof data.explanation === "string" ? data.explanation : "未能可靠识别日期",
  };
}

export async function recognizePackageDateWithVision({
  apiKey,
  imageBase64,
  mimeType,
  model = process.env.OPENAI_DATE_MODEL ?? "gpt-4.1",
  fetchImpl = fetch,
}: RecognizePackageDateInput): Promise<VisionDateResult> {
  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "请识别这张食品包装图片中的生产日期、有效期/到期日、产品批号。只返回结构化 JSON。若有效期只写到年月，例如 2027.12，则 expiryDate 取该月最后一天。若看不清，不要猜，返回 null 并降低 confidence。",
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          ...schema,
        },
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`OpenAI date recognition failed: ${response.status} ${detail}`.trim());
  }

  const json = await response.json();
  const outputText = readOutputText(json);
  if (!outputText) throw new Error("OpenAI date recognition returned no text");
  return normalizeVisionDateResult(JSON.parse(outputText));
}
