"use client";

import { useState } from "react";
import { createSketchCover } from "@/lib/adapters/sketchCover";
import { createLocation } from "@/lib/server/locations";

async function uploadFile(file: File | Blob, filename: string) {
  const form = new FormData();
  form.append("file", file, filename);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  if (!response.ok) throw new Error("上传失败");
  return (await response.json()) as { url: string };
}

export function CreateLocationForm({ familyId }: { familyId: string }) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("常温");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function save() {
    const normalizedName = name.trim();
    if (!normalizedName) {
      setMessage("位置名称不能为空");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      let photoUrl: string | undefined;
      let sketchCoverUrl: string | undefined;

      if (file) {
        const uploadedPhoto = await uploadFile(file, file.name);
        photoUrl = uploadedPhoto.url;
        try {
          const sketch = await createSketchCover(file);
          const uploadedSketch = await uploadFile(sketch, `sketch-${file.name}.jpg`);
          sketchCoverUrl = uploadedSketch.url;
        } catch {
          sketchCoverUrl = undefined;
        }
      }

      await createLocation({
        familyId,
        name: normalizedName,
        photoUrl,
        sketchCoverUrl,
        tags: tags.split(/[，,\s]+/).filter(Boolean),
      });
      setMessage("位置已保存");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后再试");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-3 rounded-lg bg-white p-4">
      <p className="text-sm text-slate-600">位置只用来帮助识别柜子、箱子或抽屉。食物放在哪里，需要添加食物时明确选择。</p>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">位置名称</span>
        <input
          aria-label="位置名称"
          className="min-h-12 w-full rounded-md border border-slate-300 p-3"
          value={name}
          placeholder="例如：妈妈零食柜"
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">标签</span>
        <input
          aria-label="标签"
          className="min-h-12 w-full rounded-md border border-slate-300 p-3"
          value={tags}
          placeholder="例如：常温 零食"
          onChange={(event) => setTags(event.target.value)}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">位置照片</span>
        <input
          className="block w-full text-sm"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <button
        className="min-h-12 w-full rounded-md bg-emerald-700 font-bold text-white disabled:bg-slate-300"
        type="button"
        disabled={isSaving}
        onClick={save}
      >
        {isSaving ? "保存中" : "保存位置"}
      </button>
      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
