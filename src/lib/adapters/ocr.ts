import { recognize } from "tesseract.js";

export type VisionDateResult = {
  productionDate: string | null;
  expiryDate: string | null;
  batchNumber: string | null;
  confidence: "high" | "medium" | "low";
  rawText: string;
  explanation: string;
};

export async function recognizeDateText(file: File): Promise<string> {
  const result = await recognize(file, "chi_sim+eng");
  return result.data.text;
}

async function readModelError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown; error?: unknown };
    if (typeof data.message === "string" && data.message.trim()) return data.message;
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  } catch {
    // Keep the fallback below when the server returned non-JSON.
  }
  return "大模型日期识别暂不可用";
}

export async function recognizeDateByVision(file: File): Promise<VisionDateResult> {
  const form = new FormData();
  form.append("file", file, file.name);
  const response = await fetch("/api/recognize-date", { method: "POST", body: form });
  if (!response.ok) throw new Error(await readModelError(response));
  return (await response.json()) as VisionDateResult;
}
