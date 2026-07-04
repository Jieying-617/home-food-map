"use client";

import { useState } from "react";
import { parsePackageDate } from "@/lib/domain/dateParser";
import { recognizeDateByVision, recognizeDateText, type VisionDateResult } from "@/lib/adapters/ocr";
import { AddFoodConfirmForm, type ConfirmDraft } from "./AddFoodConfirmForm";

function buildDraft(expiresAt: string): ConfirmDraft {
  return {
    name: "",
    quantity: 1,
    unit: "件",
    locationId: "",
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

function modelFailureMessage(error: unknown) {
  if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
    return "大模型识别未启用：请先配置 OPENAI_API_KEY 并重启服务。当前仅使用本地 OCR，可能不准。";
  }
  return "大模型识别未启用或暂不可用：当前仅使用本地 OCR，可能不准。";
}

export function DatePhotoPanel({
  familyId,
  locations,
}: {
  familyId: string;
  locations: Array<{ id: string; name: string }>;
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
      setDraft(buildDraft(vision.confidence === "low" ? "" : vision.expiryDate ?? ""));
      setMessage(vision.expiryDate && vision.confidence !== "low" ? "已识别日期，请确认后保存" : "日期不太确定，请手动选择到期日");
      return;
    } catch (error) {
      setFallbackNotice(modelFailureMessage(error));
    }

    try {
      const text = await recognizeDateText(file);
      setRecognitionSource("本地 OCR");
      setRecognizedText(text.trim());
      const parsed = parsePackageDate(text, new Date());
      const isLowConfidence = parsed.confidence === "low";
      setDraft(buildDraft(isLowConfidence ? "" : parsed.expiresAt));
      setMessage(isLowConfidence ? "日期不太确定，请手动选择到期日" : "本地 OCR 已提取日期，请仔细确认后保存");
    } catch {
      setMessage("识别失败，请手动选择到期日");
      setDraft(buildDraft(""));
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
