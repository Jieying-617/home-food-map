import { NextResponse } from "next/server";
import { generateLocationCoverWithComfy, isComfyLocationCoverConfigured } from "@/lib/server/locationCoverComfy";

export const runtime = "nodejs";

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value && typeof value.arrayBuffer === "function";
}

function getModelErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "AI location cover generation failed";
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!isUploadedFile(file)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }

  if (!isComfyLocationCoverConfigured()) {
    return NextResponse.json(
      {
        error: "LOCATION_COVER_GENERATION_NOT_CONFIGURED",
        message: "未配置本地 ComfyUI：请设置 COMFYUI_BASE_URL 和 COMFYUI_WORKFLOW_PATH。当前会使用原图作为位置图片。",
      },
      { status: 503 },
    );
  }

  try {
    const result = await generateLocationCoverWithComfy({
      imageBytes: Buffer.from(await file.arrayBuffer()),
      mimeType: file.type || "image/png",
      filename: file.name || "location-cover.png",
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "LOCATION_COVER_GENERATION_FAILED",
        message: `${getModelErrorMessage(error)}。当前会使用原图作为位置图片。`,
      },
      { status: 502 },
    );
  }
}
