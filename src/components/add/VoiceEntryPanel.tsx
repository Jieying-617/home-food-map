"use client";

import { useState } from "react";
import { parseVoiceEntry } from "@/lib/domain/voiceParser";
import { listenOnce, supportsSpeechRecognition } from "@/lib/adapters/speech";
import { AddFoodConfirmForm, type ConfirmDraft } from "./AddFoodConfirmForm";

export function VoiceEntryPanel({
  familyId,
  locations,
}: {
  familyId: string;
  locations: Array<{ id: string; name: string }>;
}) {
  const [draft, setDraft] = useState<ConfirmDraft | null>(null);
  const [message, setMessage] = useState("");

  async function startVoice() {
    if (!supportsSpeechRecognition()) {
      setMessage("当前浏览器不支持语音识别，请使用手动添加");
      return;
    }

    try {
      const result = await listenOnce();
      const parsed = parseVoiceEntry(
        result.transcript,
        locations.map((location) => location.name),
        new Date(),
      );
      const matchedLocation = locations.find((location) => location.name === parsed.locationName);
      setDraft({
        name: parsed.name,
        quantity: parsed.quantity,
        unit: parsed.unit,
        locationId: matchedLocation?.id ?? "",
        expiresAt: parsed.expiresAt,
        source: "voice",
      });
      setMessage(`识别到：${result.transcript}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "语音识别失败");
    }
  }

  return (
    <section className="rounded-lg bg-white p-4">
      <h2 className="text-lg font-bold">说一句添加</h2>
      <button className="mt-3 min-h-12 w-full rounded-md bg-emerald-700 font-bold text-white" type="button" onClick={startVoice}>
        开始说话
      </button>
      {message ? <p className="mt-2 text-sm text-slate-600">{message}</p> : null}
      {draft ? (
        <div className="mt-4">
          <AddFoodConfirmForm familyId={familyId} locations={locations} draft={draft} />
        </div>
      ) : null}
    </section>
  );
}
