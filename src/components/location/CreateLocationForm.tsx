"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Save, WandSparkles } from "lucide-react";
import { createLocation } from "@/lib/server/locations";

async function uploadFile(file: File | Blob, filename: string) {
  const form = new FormData();
  form.append("file", file, filename);
  const response = await fetch("/api/upload", { method: "POST", body: form });
  if (!response.ok) throw new Error("上传失败");
  return (await response.json()) as { url: string };
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

async function generateLocationCover(file: File) {
  const form = new FormData();
  form.append("file", file, file.name);
  const response = await fetch("/api/generate-location-cover", { method: "POST", body: form });
  const payload = (await response.json().catch(() => ({}))) as {
    imageBase64?: string;
    mimeType?: string;
    filename?: string;
    message?: string;
  };

  if (!response.ok || !payload.imageBase64) {
    throw new Error(payload.message ?? "AI 卡通封面暂时无法生成，将保存原图作为位置图片。");
  }

  return {
    blob: base64ToBlob(payload.imageBase64, payload.mimeType ?? "image/png"),
    filename: payload.filename ?? `ai-cover-${file.name}.png`,
  };
}

const inputClass = "field-control";

export function CreateLocationForm({ familyId }: { familyId: string }) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("常温");
  const [file, setFile] = useState<File | null>(null);
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [coverFilename, setCoverFilename] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const previewUrlRef = useRef("");

  function replacePreviewUrl(nextUrl: string) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = nextUrl;
    setCoverPreviewUrl(nextUrl);
  }

  async function chooseFile(nextFile: File | null) {
    setFile(nextFile);
    if (!nextFile) {
      replacePreviewUrl("");
      setCoverBlob(null);
      setCoverFilename("");
      setIsGeneratingCover(false);
      setMessage("");
      return;
    }

    const originalPreviewUrl = URL.createObjectURL(nextFile);
    replacePreviewUrl(originalPreviewUrl);
    setCoverBlob(null);
    setCoverFilename("");
    setIsGeneratingCover(true);
    setMessage("正在用本地 ComfyUI 生成 AI 卡通封面...");

    try {
      const cover = await generateLocationCover(nextFile);
      if (previewUrlRef.current !== originalPreviewUrl) return;
      const coverPreviewUrl = URL.createObjectURL(cover.blob);
      replacePreviewUrl(coverPreviewUrl);
      setCoverBlob(cover.blob);
      setCoverFilename(cover.filename);
      setMessage("AI 卡通封面已生成。确认满意后保存位置。");
      setIsGeneratingCover(false);
    } catch (error) {
      if (previewUrlRef.current !== originalPreviewUrl) return;
      setCoverBlob(null);
      setCoverFilename("");
      setMessage(error instanceof Error ? error.message : "AI 卡通封面暂时无法生成，将保存原图作为位置图片。");
      setIsGeneratingCover(false);
    } finally {
      if (previewUrlRef.current === originalPreviewUrl) setIsGeneratingCover(false);
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

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
        if (coverBlob) {
          const uploadedCover = await uploadFile(coverBlob, coverFilename || `ai-cover-${file.name}.png`);
          sketchCoverUrl = uploadedCover.url;
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
    <section className="surface-card space-y-4 p-4 sm:p-5">
      <p className="text-sm leading-6 text-slate-600">
        位置用于帮助家里人快速找到食物。照片不是必填；配置本地 ComfyUI 后，会生成真正的 AI 卡通柜子封面。
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
      <label className="upload-panel">
        <span className="mb-2 block text-sm font-bold text-[var(--color-primary-strong)]">位置照片</span>
        <input
          className="upload-input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => void chooseFile(event.target.files?.[0] ?? null)}
        />
      </label>
      {file ? (
        <div className="surface-card-muted grid gap-3 p-3 sm:grid-cols-[140px_1fr] sm:items-center">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-[var(--color-muted)]">
            {coverPreviewUrl ? (
              <img src={coverPreviewUrl} alt="位置封面预览" className="h-full w-full object-contain" />
            ) : (
              <ImagePlus aria-hidden className="h-8 w-8 text-slate-400" />
            )}
          </div>
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black text-slate-950">
              <WandSparkles aria-hidden className="h-4 w-4 text-[var(--color-accent)]" />
              {coverBlob ? "AI 卡通封面预览" : "原图预览"}
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {coverBlob
                ? "这是由本地 ComfyUI 生成的卡通柜子图，保存后会用于位置卡片。"
                : isGeneratingCover
                  ? "正在生成真正的卡通图；生成前先显示原图。"
                  : "AI 生成不可用时，会保存原图，不再使用本地滤镜假装卡通化。"}
            </p>
          </div>
        </div>
      ) : null}
      <button
        className="btn-primary w-full"
        type="button"
        disabled={isSaving}
        onClick={save}
      >
        <Save aria-hidden className="h-4 w-4" />
        {isSaving ? "保存中..." : "保存位置"}
      </button>
      {message ? <p className="status-note">{message}</p> : null}
    </section>
  );
}
