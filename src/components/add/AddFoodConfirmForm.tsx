"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Home, MapPin } from "lucide-react";
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

type FieldErrors = Partial<Record<"name" | "locationId" | "expiresAt", string>>;

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

function getSourceCopy(source: ConfirmDraft["source"]) {
  if (source === "date-photo") {
    return {
      title: "拍照识别结果，请确认后保存",
      description: "名称、数量、位置和到期日都可以手动修改。",
    };
  }
  if (source === "voice") {
    return {
      title: "语音识别结果，请确认后保存",
      description: "如果识别错了，直接在下面改成正确内容。",
    };
  }
  return {
    title: "手动添加食物",
    description: "填写名称、数量、位置和到期日后保存到库存。",
  };
}

function validate(form: ConfirmDraft): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) errors.name = "请填写食物名称。";
  if (!form.locationId) errors.locationId = "请选择存放位置。";
  if (!form.expiresAt) errors.expiresAt = "请选择到期日。";
  return errors;
}

const inputClass = "min-h-12 w-full rounded-md border border-slate-300 bg-white p-3 text-base text-slate-950 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]";
const errorInputClass = "border-red-400 focus:border-red-500 focus:ring-red-100";
const fieldErrorClass = "mt-1 text-sm font-semibold text-red-700";
const commonUnits = ["件", "包", "袋", "盒", "瓶", "罐", "斤"];

export function AddFoodConfirmForm({ familyId, locations, draft }: AddFoodConfirmFormProps) {
  const [form, setForm] = useState(draft);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [savedLocationId, setSavedLocationId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const sourceCopy = getSourceCopy(draft.source);

  async function save() {
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
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
    setFieldErrors({});
    setMessage("");
    setSavedLocationId("");
  }

  function updateForm(nextForm: ConfirmDraft) {
    setForm(nextForm);
    if (Object.keys(fieldErrors).length > 0) setFieldErrors(validate(nextForm));
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--color-border)] bg-white p-4 sm:p-5">
      <div className="rounded-lg bg-[var(--color-primary-soft)] p-3">
        <p className="text-base font-black text-slate-950">{sourceCopy.title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">{sourceCopy.description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-bold text-slate-700">食物名称</span>
          <input
            aria-invalid={Boolean(fieldErrors.name)}
            className={`${inputClass} ${fieldErrors.name ? errorInputClass : ""}`}
            value={form.name}
            placeholder="例如：鸡蛋、牛奶、吐司"
            onChange={(event) => updateForm({ ...form, name: event.target.value })}
          />
          {fieldErrors.name ? <p className={fieldErrorClass} role="alert">{fieldErrors.name}</p> : null}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700">数量</span>
          <input
            className={inputClass}
            type="number"
            min="0.1"
            step="0.1"
            value={form.quantity}
            onChange={(event) => updateForm({ ...form, quantity: Number(event.target.value) })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700">单位</span>
          <input
            className={inputClass}
            value={form.unit}
            placeholder="盒、袋、瓶"
            onChange={(event) => updateForm({ ...form, unit: event.target.value })}
          />
        </label>
      </div>

      <div aria-label="常用单位" className="flex flex-wrap gap-2">
        {commonUnits.map((unit) => (
          <button
            key={unit}
            className={`min-h-11 min-w-11 rounded-md border px-3 text-sm font-bold ${form.unit === unit ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" : "border-[var(--color-border)] bg-white text-slate-700 hover:bg-[var(--color-muted)]"}`}
            type="button"
            onClick={() => updateForm({ ...form, unit })}
          >
            {unit}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-700">存放位置</span>
        <select
          aria-invalid={Boolean(fieldErrors.locationId)}
          aria-label="存放位置"
          className={`${inputClass} ${fieldErrors.locationId ? errorInputClass : ""}`}
          value={form.locationId}
          onChange={(event) => updateForm({ ...form, locationId: event.target.value })}
        >
          <option value="">选择放在哪里</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        {fieldErrors.locationId ? <p className={fieldErrorClass} role="alert">{fieldErrors.locationId}</p> : null}
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-700">到期日</span>
        <input
          aria-invalid={Boolean(fieldErrors.expiresAt)}
          aria-label="到期日"
          className={`${inputClass} ${fieldErrors.expiresAt ? errorInputClass : ""}`}
          type="date"
          value={form.expiresAt}
          onChange={(event) => updateForm({ ...form, expiresAt: event.target.value })}
        />
        {fieldErrors.expiresAt ? <p className={fieldErrorClass} role="alert">{fieldErrors.expiresAt}</p> : null}
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
      {message ? <p className="text-sm font-semibold text-slate-700" role="status">{message}</p> : null}
      {savedLocationId ? (
        <div className="grid gap-3 rounded-md bg-[var(--color-primary-soft)] p-3 sm:grid-cols-3">
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
          <Link
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-white px-3 text-sm font-bold text-[var(--color-primary-strong)] hover:bg-[var(--color-muted)]"
            href={`/f/${familyId}`}
          >
            <Home aria-hidden className="h-4 w-4" />
            回提醒首页
          </Link>
        </div>
      ) : null}
    </div>
  );
}
