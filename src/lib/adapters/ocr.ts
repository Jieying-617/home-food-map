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

export async function recognizeDateByVision(file: File): Promise<VisionDateResult> {
  const form = new FormData();
  form.append("file", file, file.name);
  const response = await fetch("/api/recognize-date", { method: "POST", body: form });
  if (!response.ok) throw new Error("大模型日期识别暂不可用");
  return (await response.json()) as VisionDateResult;
}
