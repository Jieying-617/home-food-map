"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { parseVoiceEntry } from "@/lib/domain/voiceParser";
import { listenOnce, supportsSpeechRecognition } from "@/lib/adapters/speech";
import { AddFoodConfirmForm, type ConfirmDraft } from "./AddFoodConfirmForm";

export function VoiceEntryPanel({
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

  async function startVoice() {
    if (!supportsSpeechRecognition()) {
      setMessage("当前浏览器不支持语音识别，请使用手动添加。");
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
        locationId: matchedLocation?.id ?? initialLocationId,
        expiresAt: parsed.expiresAt,
        source: "voice",
      });
      setMessage(`识别到：${result.transcript}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "语音识别失败。");
    }
  }

  return (
    <section className="surface-card p-4">
      <div className="flex items-start gap-3">
        <div className="icon-tile">
          <Mic aria-hidden className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-950">说一句添加</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">适合刚买完东西：比如“牛奶 2 盒放冰箱，7 月 12 日到期”。</p>
        </div>
      </div>
      <button
        className="btn-primary mt-4 w-full"
        type="button"
        onClick={startVoice}
      >
        <Mic aria-hidden className="h-4 w-4" />
        开始说话
      </button>
      {message ? <p className="status-note mt-3">{message}</p> : null}
      {draft ? (
        <div className="mt-4">
          <AddFoodConfirmForm familyId={familyId} locations={locations} draft={draft} />
        </div>
      ) : null}
    </section>
  );
}
