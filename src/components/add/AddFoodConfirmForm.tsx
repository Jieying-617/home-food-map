"use client";

import Link from "next/link";
import { useState } from "react";
import { createFood } from "@/lib/server/foods";

export type ConfirmDraft = {
  name: string;
  quantity: number;
  unit: string;
  locationId: string;
  expiresAt: string;
  source: "manual" | "voice" | "date-photo";
};

type AddFoodConfirmFormProps = {
  familyId: string;
  locations: Array<{ id: string; name: string }>;
  draft: ConfirmDraft;
};

function nextBlankDraft(draft: ConfirmDraft, locationId: string): ConfirmDraft {
  return {
    ...draft,
    name: "",
    quantity: 1,
    unit: "件",
    locationId,
    expiresAt: "",
  };
}

export function AddFoodConfirmForm({ familyId, locations, draft }: AddFoodConfirmFormProps) {
  const [form, setForm] = useState(draft);
  const [message, setMessage] = useState("");
  const [savedLocationId, setSavedLocationId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (!form.name.trim() || !form.locationId || !form.expiresAt) {
      setMessage("名称、位置、到期日都要确认后才能保存");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      await createFood({
        familyId,
        ...form,
        name: form.name.trim(),
        unit: form.unit.trim() || "件",
        quantity: Number.isFinite(form.quantity) && form.quantity > 0 ? form.quantity : 1,
      });
      setSavedLocationId(form.locationId);
      setMessage("已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后再试");
    } finally {
      setIsSaving(false);
    }
  }

  function continueAdding() {
    setForm(nextBlankDraft(draft, savedLocationId || form.locationId));
    setMessage("");
    setSavedLocationId("");
  }

  return (
    <div className="space-y-3 rounded-lg bg-white p-4">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">食物名称</span>
        <input
          className="min-h-12 w-full rounded-md border border-slate-300 p-3"
          value={form.name}
          placeholder="例如：蛋黄派"
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">数量</span>
          <input
            className="min-h-12 w-full rounded-md border border-slate-300 p-3"
            type="number"
            min="0.1"
            step="0.1"
            value={form.quantity}
            onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">单位</span>
          <input
            className="min-h-12 w-full rounded-md border border-slate-300 p-3"
            value={form.unit}
            placeholder="包"
            onChange={(event) => setForm({ ...form, unit: event.target.value })}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">存放位置</span>
        <select
          aria-label="存放位置"
          className="min-h-12 w-full rounded-md border border-slate-300 p-3"
          value={form.locationId}
          onChange={(event) => setForm({ ...form, locationId: event.target.value })}
        >
          <option value="">选择放在哪里</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">到期日</span>
        <input
          aria-label="到期日"
          className="min-h-12 w-full rounded-md border border-slate-300 p-3"
          type="date"
          value={form.expiresAt}
          onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
        />
      </label>
      <button
        className="min-h-12 w-full rounded-md bg-emerald-700 font-bold text-white disabled:bg-slate-300"
        type="button"
        disabled={isSaving}
        onClick={save}
      >
        {isSaving ? "保存中" : "确认保存"}
      </button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      {savedLocationId ? (
        <div className="grid grid-cols-2 gap-3 rounded-md bg-emerald-50 p-3">
          <button
            className="min-h-11 rounded-md bg-white px-3 text-sm font-bold text-emerald-800"
            type="button"
            onClick={continueAdding}
          >
            继续添加同位置
          </button>
          <Link
            className="flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-3 text-sm font-bold text-white"
            href={`/f/${familyId}/locations/${savedLocationId}`}
          >
            查看这个位置
          </Link>
        </div>
      ) : null}
    </div>
  );
}
