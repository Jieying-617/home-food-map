"use client";

import { useState } from "react";
import { parsePackageDate } from "@/lib/domain/dateParser";
import { recognizeDateText } from "@/lib/adapters/ocr";
import { AddFoodConfirmForm, type ConfirmDraft } from "./AddFoodConfirmForm";

export function DatePhotoPanel({
  familyId,
  locations,
}: {
  familyId: string;
  locations: Array<{ id: string; name: string }>;
}) {
  const [draft, setDraft] = useState<ConfirmDraft | null>(null);
  const [message, setMessage] = useState("");

  async function handleFile(file: File | null) {
    if (!file) return;
    setMessage("正在识别日期...");
    try {
      const text = await recognizeDateText(file);
      const parsed = parsePackageDate(text, new Date());
      setDraft({
        name: "",
        quantity: 1,
        unit: "件",
        locationId: "",
        expiresAt: parsed.expiresAt,
        source: "date-photo",
      });
      setMessage(parsed.confidence === "low" ? "日期不太确定，请仔细确认" : "已识别日期，请确认后保存");
    } catch {
      setMessage("识别失败，请手动选择到期日");
      setDraft({ name: "", quantity: 1, unit: "件", locationId: "", expiresAt: "", source: "date-photo" });
    }
  }

  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-lg font-bold">拍日期添加</h2>
      <input
        className="mt-3 block w-full text-sm"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
      />
      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
      {draft ? (
        <div className="mt-4">
          <AddFoodConfirmForm familyId={familyId} locations={locations} draft={draft} />
        </div>
      ) : null}
    </section>
  );
}
