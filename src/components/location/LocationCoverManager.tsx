"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Save } from "lucide-react";
import { createSketchCover } from "@/lib/adapters/sketchCover";
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

export function LocationCoverManager({ familyId, location }: LocationCoverManagerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [coverBlob, setCoverBlob] = useState<Blob | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentCover = location.sketchCoverUrl || location.photoUrl;

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
    setMessage("");

    createSketchCover(file)
      .then((blob) => {
        if (!isActive) return;
        objectUrl = URL.createObjectURL(blob);
        setCoverBlob(blob);
        setCoverPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!isActive) return;
        setMessage("卡通封面暂时无法生成，仍可保存原图作为位置照片。");
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
        const uploadedCover = await uploadFile(coverBlob, `cartoon-${file.name}.png`);
        sketchCoverUrl = uploadedCover.url;
      }

      await updateLocationCover({
        familyId,
        locationId: location.id,
        photoUrl: uploadedPhoto.url,
        sketchCoverUrl,
      });
      setMessage("位置图片已更换，封面已重新生成。");
      setFile(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后再试。");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-4 rounded-lg border border-[var(--color-border)] bg-white p-4 sm:p-5 lg:grid-cols-[220px_1fr]">
      <div className="overflow-hidden rounded-lg bg-[#fff6e5]">
        {coverPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverPreviewUrl} alt="新的卡通位置封面预览" className="aspect-[4/3] h-full w-full object-contain" />
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
          <h2 className="mt-1 text-xl font-black text-slate-950">更换照片并重新生成封面</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            选择新的柜子、箱子或抽屉照片后，会先生成新的卡通封面预览。确认满意后再保存。
          </p>
        </div>

        <label className="block rounded-lg border border-dashed border-[var(--color-primary)] bg-[var(--color-primary-soft)] p-4">
          <span className="mb-2 block text-sm font-bold text-[var(--color-primary-strong)]">新的位置照片</span>
          <input
            className="block w-full text-sm text-slate-700 file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-md file:border-0 file:bg-white file:px-3 file:text-sm file:font-bold file:text-[var(--color-primary-strong)]"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>

        {file ? (
          <p className="rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
            {coverPreviewUrl ? "新封面预览已生成。" : isGeneratingCover ? "正在生成新封面..." : "已选择新照片。"}
          </p>
        ) : null}

        <button
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-4 font-bold text-white hover:bg-[var(--color-primary-strong)] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
          type="button"
          disabled={isSaving}
          onClick={save}
        >
          <Save aria-hidden className="h-4 w-4" />
          {isSaving ? "保存中..." : "保存新图片"}
        </button>
        {message ? <p className="text-sm font-semibold text-slate-700">{message}</p> : null}
      </div>
    </section>
  );
}
