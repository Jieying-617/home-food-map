"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { createSketchCover } from "@/lib/adapters/sketchCover";
import { createLocation } from "@/lib/server/locations";

async function uploadFile(file: File | Blob, filename: string) {
  const form = new FormData();
  form.append("file", file, filename);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  if (!response.ok) throw new Error("上传失败");
  return (await response.json()) as { url: string };
}

const inputClass = "min-h-12 w-full rounded-md border border-slate-300 bg-white p-3 text-slate-950";

export function CreateLocationForm({ familyId }: { familyId: string }) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("常温");
  const [file, setFile] = useState<File | null>(null);
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!file) {
      setCoverBlob(null);
      setCoverPreviewUrl("");
      setIsGeneratingCover(false);
      return;
    }

    let isActive = true;
    let objectUrl = "";
    setIsGeneratingCover(true);
    setCoverBlob(null);
    setCoverPreviewUrl("");

    createSketchCover(file)
      .then((blob) => {
        if (!isActive) return;
        objectUrl = URL.createObjectURL(blob);
        setCoverBlob(blob);
        setCoverPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!isActive) return;
        setCoverBlob(null);
        setCoverPreviewUrl("");
      })
      .finally(() => {
        if (isActive) setIsGeneratingCover(false);
      });

    return () => {
      isActive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  async function save() {
    const normalizedName = name.trim();
    if (!normalizedName) {
      setMessage("位置名称不能为空。");
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
          const sketch = coverBlob ?? (await createSketchCover(file));
          const uploadedSketch = await uploadFile(sketch, `cartoon-${file.name}.png`);
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
      setMessage("位置已保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-lg border border-[var(--color-border)] bg-white p-4 sm:p-5">
      <p className="text-sm leading-6 text-slate-600">
        位置用于帮助家里人快速找到食物。照片不是必填，但有照片时位置地图更容易辨认。
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700">位置名称</span>
          <input
            aria-label="位置名称"
            className={inputClass}
            value={name}
            placeholder="例如：妈妈零食柜"
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-700">标签</span>
          <input
            aria-label="标签"
            className={inputClass}
            value={tags}
            placeholder="例如：常温 零食"
            onChange={(event) => setTags(event.target.value)}
          />
        </label>
      </div>
      <label className="block rounded-lg border border-dashed border-[var(--color-primary)] bg-[var(--color-primary-soft)] p-4">
        <span className="mb-2 block text-sm font-bold text-[var(--color-primary-strong)]">位置照片</span>
        <input
          className="block w-full text-sm text-slate-700 file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-md file:border-0 file:bg-white file:px-3 file:text-sm file:font-bold file:text-[var(--color-primary-strong)]"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
      </label>
      {file ? (
        <div className="grid gap-3 rounded-lg border border-[var(--color-border)] bg-white p-3 sm:grid-cols-[120px_1fr] sm:items-center">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-[#fff6e5]">
            {coverPreviewUrl ? (
              <img src={coverPreviewUrl} alt="卡通位置封面预览" className="h-full w-full object-contain" />
            ) : (
              <span className="px-3 text-center text-xs font-bold text-slate-500">
                {isGeneratingCover ? "正在生成卡通封面" : "暂时无法预览"}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-black text-slate-950">卡通封面预览</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              会尽量去掉杂色背景，只保留柜子主体，并保持原来的颜色、结构和形状。
            </p>
          </div>
        </div>
      ) : null}
      <button
        className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 font-bold text-white hover:bg-[var(--color-primary-strong)] disabled:cursor-not-allowed disabled:bg-slate-300"
        type="button"
        disabled={isSaving}
        onClick={save}
      >
        <Save aria-hidden className="h-4 w-4" />
        {isSaving ? "保存中..." : "保存位置"}
      </button>
      {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
    </section>
  );
}
