"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Save, WandSparkles } from "lucide-react";
import { updateLocationCover } from "@/lib/server/locations";

type LocationCoverManagerProps = {
  familyId: string;
  location: {
    id: string;
    name: string;
    photoUrl: string | null;
    sketchCoverUrl: string | null;
  };
};

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

export function LocationCoverManager({ familyId, location }: LocationCoverManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [coverFilename, setCoverFilename] = useState("");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentCover = location.sketchCoverUrl || location.photoUrl;
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
      setMessage("AI 卡通封面已生成。确认满意后保存新图片。");
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
    if (!file) {
      setMessage("请先选择一张新的位置照片。");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      const uploadedPhoto = await uploadFile(file, file.name);
      let sketchCoverUrl: string | undefined;

      if (coverBlob) {
        const uploadedCover = await uploadFile(coverBlob, coverFilename || `ai-cover-${file.name}.png`);
        sketchCoverUrl = uploadedCover.url;
      }

      await updateLocationCover({
        familyId,
        locationId: location.id,
        photoUrl: uploadedPhoto.url,
        sketchCoverUrl,
      });
      chooseFile(null);
      setMessage("位置图片已更换。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="surface-card grid gap-4 p-4 sm:p-5 lg:grid-cols-[220px_1fr]">
      <div className="overflow-hidden rounded-lg bg-[var(--color-muted)]">
        {coverPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreviewUrl} alt="新的位置封面预览" className="aspect-[4/3] h-full w-full object-contain" />
        ) : currentCover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentCover} alt={location.name} className="aspect-[4/3] h-full w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] h-full w-full flex-col items-center justify-center gap-2 text-slate-500">
            <ImagePlus aria-hidden className="h-8 w-8" />
            <span className="text-sm font-bold">还没有位置图片</span>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">位置图片</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">更换照片并生成 AI 卡通封面</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            选择新的柜子、箱子或抽屉照片后，会优先调用本地 ComfyUI 生成真正的卡通封面；不可用时保存原图。
          </p>
        </div>

        <label className="upload-panel">
          <span className="mb-2 block text-sm font-bold text-[var(--color-primary-strong)]">新的位置照片</span>
          <input
            className="upload-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => void chooseFile(event.target.files?.[0] ?? null)}
          />
        </label>

        {file ? (
          <p className="status-note inline-flex items-start gap-2">
            <WandSparkles aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
            <span>{coverBlob ? "AI 卡通封面预览已生成。" : isGeneratingCover ? "正在生成真正的卡通图；生成前先显示原图。" : "AI 生成不可用时会保存原图。"}</span>
          </p>
        ) : null}

        <button
          className="btn-primary w-full sm:w-auto"
          type="button"
          disabled={isSaving}
          onClick={save}
        >
          <Save aria-hidden className="h-4 w-4" />
          {isSaving ? "保存中..." : "保存新图片"}
        </button>
        {message ? <p className="status-note">{message}</p> : null}
      </div>
    </section>
  );
}
