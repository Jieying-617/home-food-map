"use client";

import { Keyboard } from "lucide-react";
import { AddFoodConfirmForm } from "./AddFoodConfirmForm";

export function ManualEntryPanel({
  familyId,
  locations,
  initialLocationId = "",
}: {
  familyId: string;
  locations: Array<{ id: string; name: string }>;
  initialLocationId?: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Keyboard aria-hidden className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-950">手动添加</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">适合补录、修正或语音识别不方便的场景。</p>
        </div>
      </div>
      <AddFoodConfirmForm
        familyId={familyId}
        locations={locations}
        draft={{ name: "", quantity: 1, unit: "件", locationId: initialLocationId, expiresAt: "", source: "manual" }}
      />
    </section>
  );
}
