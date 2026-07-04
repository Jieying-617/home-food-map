"use client";

import { useState } from "react";
import { parsePackageDate, type ParsedPackageDate } from "@/lib/domain/dateParser";
import { recognizeDateByVision, recognizeDateText, type VisionDateResult } from "@/lib/adapters/ocr";
import { AddFoodConfirmForm, type ConfirmDraft } from "./AddFoodConfirmForm";

function buildDraft(expiresAt: string, locationId = ""): ConfirmDraft {
  return {
    name: "",
    quantity: 1,
    unit: "件",
    locationId,
    expiresAt,
    source: "date-photo",
  };
}

function describeVisionResult(result: VisionDateResult) {
  const lines = [];
  if (result.batchNumber) lines.push(`批号：${result.batchNumber}`);
  if (result.productionDate) lines.push(`生产日期：${result.productionDate}`);
  if (result.expiryDate) lines.push(`到期日：${result.expiryDate}`);
  if (result.explanation) lines.push(result.explanation);
  if (result.rawText) lines.push(`原文：${result.rawText}`);
  return lines.join("\n");
}

function describeLocalOcrResult(text: string, parsed: ParsedPackageDate) {
  const trimmed = text.trim();
  if (parsed.confidence === "low") return trimmed;

  const lines = [`到期日：${parsed.expiresAt}`];
  if (parsed.source === "ocr-expiry-candidate") {
    lines.push("中文标签识别不完整，已从完整日期候选中提取，请确认。");
  }
  if (trimmed) lines.push(`原文：${trimmed}`);
  return lines.join("\n");
}

function modelFailureMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("No model date recognition provider is configured")) {
    return "大模型识别未启用：请先配置 OPENROUTER_API_KEY、GEMINI_API_KEY 或 OPENAI_API_KEY 并重启服务。当前仅使用本地 OCR，可能不准。";
  }
  if (message.includes("OPENAI_API_KEY")) {
    return "OpenAI 识别未启用：请先配置 OPENAI_API_KEY 并重启服务。当前仅使用本地 OCR，可能不准。";
  }
  if (message.includes("Gemini") && (message.includes("API key not valid") || message.includes("API_KEY_INVALID"))) {
    return "Gemini API Key 无效：请在 Google AI Studio 重新创建 key，更新 .env 后重启服务。当前仅使用本地 OCR，可能不准。";
  }
  if (message.includes("invalid_api_key") || message.includes("401")) {
    return "大模型 API Key 无效：请检查 .env 中的 OpenRouter/Gemini/OpenAI key 并重启服务。当前仅使用本地 OCR，可能不准。";
  }
  if (
    message.includes("OpenRouter") ||
    message.includes("rate-limited upstream") ||
    message.includes("rate limit")
  ) {
    return "OpenRouter 免费模型暂时限流：可以稍后重试，或配置 Gemini 作为备用。当前仅使用本地 OCR，可能不准。";
  }
  if (message.includes("insufficient_quota") || message.includes("exceeded your current quota")) {
    return "OpenAI API 额度不足：请检查账号计费或充值。当前仅使用本地 OCR，可能不准。";
  }
  if (message.includes("429")) {
    return "大模型暂时限流：可以稍后重试，或配置其他模型作为备用。当前仅使用本地 OCR，可能不准。";
  }
  if (message.includes("connect") || message.includes("timeout") || message.includes("fetch failed")) {
    return "大模型识别连接失败：请检查代理或网络。当前仅使用本地 OCR，可能不准。";
  }
  return "大模型识别暂不可用：当前仅使用本地 OCR，可能不准。";
}

export function DatePhotoPanel({
  familyId,
  locations,
  initialLocationId = "",
}: {
  familyId: string;
  locations: Array<{ id: string; name: string }>;
  initialLocationId?: string;
}) {
  const [draft, setDraft] = useState<ConfirmDraft | null>(null);
  const [message, setMessage] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [recognitionSource, setRecognitionSource] = useState("");
  const [fallbackNotice, setFallbackNotice] = useState("");

  async function handleFile(file: File | null) {
    if (!file) return;
    setMessage("正在识别日期...");
    setRecognizedText("");
    setRecognitionSource("");
    setFallbackNotice("");

    try {
      const vision = await recognizeDateByVision(file);
      setRecognitionSource("大模型识别");
      setRecognizedText(describeVisionResult(vision));
      setDraft(buildDraft(vision.confidence === "low" ? "" : vision.expiryDate ?? "", initialLocationId));
      setMessage(vision.expiryDate && vision.confidence !== "low" ? "已识别日期，请确认后保存" : "日期不太确定，请手动选择到期日");
      return;
    } catch (error) {
      setFallbackNotice(modelFailureMessage(error));
    }

    try {
      const text = await recognizeDateText(file);
      setRecognitionSource("本地 OCR");
      const parsed = parsePackageDate(text, new Date());
      setRecognizedText(describeLocalOcrResult(text, parsed));
      const isLowConfidence = parsed.confidence === "low";
      setDraft(buildDraft(isLowConfidence ? "" : parsed.expiresAt, initialLocationId));
      setMessage(isLowConfidence ? "日期不太确定，请手动选择到期日" : "本地 OCR 已提取日期，请仔细确认后保存");
    } catch {
      setMessage("识别失败，请手动选择到期日");
      setDraft(buildDraft("", initialLocationId));
    }
  }

  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-lg font-bold">拍日期添加</h2>
      <label className="mt-3 block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">上传日期照片</span>
        <input
          aria-label="上传日期照片"
          className="block w-full text-sm"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <p className="mt-2 text-xs text-slate-500">优先使用大模型理解包装日期；失败时回退本地 OCR。保存前仍需要你确认。</p>
      {fallbackNotice ? <p className="mt-2 rounded-md bg-yellow-50 p-3 text-sm font-semibold text-yellow-800">{fallbackNotice}</p> : null}
      {message ? <p className="mt-2 text-sm font-semibold text-slate-700">{message}</p> : null}
      {recognizedText ? (
        <details className="mt-2 rounded-md bg-slate-50 p-3 text-xs text-slate-600" open>
          <summary className="cursor-pointer font-semibold">识别原文{recognitionSource ? `（${recognitionSource}）` : ""}</summary>
          <pre className="mt-2 whitespace-pre-wrap font-sans">{recognizedText}</pre>
        </details>
      ) : null}
      {draft ? (
        <div className="mt-4">
          <AddFoodConfirmForm familyId={familyId} locations={locations} draft={draft} />
        </div>
      ) : null}
    </section>
  );
}
