"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, MapPin } from "lucide-react";
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

const inputClass = "min-h-12 w-full rounded-md border border-slate-300 bg-white p-3 text-slate-950";

export function AddFoodConfirmForm({ familyId, locations, draft }: AddFoodConfirmFormProps) {
  const [form, setForm] = useState(draft);
  const [message, setMessage] = useState("");
  const [savedLocationId, setSavedLocationId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    if (!form.name.trim() || !form.locationId || !form.expiresAt) {
      setMessage("名称、位置、到期日都确认后才能保存。");
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
      setMessage("已保存到库存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后再试。");
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
    <div className="space-y-3 rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-bold text-slate-700">食物名称</span>
          <input
            className={inputClass}
            value={form.name}
            placeholder="例如：鸡蛋、牛奶、吐司"
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700">数量</span>
          <input
            className={inputClass}
            type="number"
            min="0.1"
            step="0.1"
            value={form.quantity}
            onChange={(event) => setForm({ ...form, quantity: Number(event.target.value) })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700">单位</span>
          <input
            className={inputClass}
            value={form.unit}
            placeholder="盒、袋、瓶"
            onChange={(event) => setForm({ ...form, unit: event.target.value })}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-700">存放位置</span>
        <select
          aria-label="存放位置"
          className={inputClass}
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
        <span className="mb-1 block text-sm font-bold text-slate-700">到期日</span>
        <input
          aria-label="到期日"
          className={inputClass}
          type="date"
          value={form.expiresAt}
          onChange={(event) => setForm({ ...form, expiresAt: event.target.value })}
        />
      </label>
      <button
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 font-bold text-white hover:bg-[var(--color-primary-strong)] disabled:cursor-not-allowed disabled:bg-slate-300"
        type="button"
        disabled={isSaving}
        onClick={save}
      >
        <Check aria-hidden className="h-4 w-4" />
        {isSaving ? "保存中..." : "确认保存"}
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
      {savedLocationId ? (
        <div className="grid gap-3 rounded-md bg-[var(--color-primary-soft)] p-3 sm:grid-cols-2">
          <button
            className="min-h-11 cursor-pointer rounded-md bg-white px-3 text-sm font-bold text-[var(--color-primary-strong)] hover:bg-[var(--color-muted)]"
            type="button"
            onClick={continueAdding}
          >
            继续添加同位置
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-3 text-sm font-bold text-white hover:bg-[var(--color-primary-strong)]"
            href={`/f/${familyId}/locations/${savedLocationId}`}
          >
            <MapPin aria-hidden className="h-4 w-4" />
            查看这个位置
          </Link>
        </div>
      ) : null}
    </div>
  );
}
