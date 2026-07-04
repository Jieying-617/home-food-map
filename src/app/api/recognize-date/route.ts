import { NextResponse } from "next/server";
import { recognizePackageDateWithVision } from "@/lib/server/dateVision";

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value && typeof value.arrayBuffer === "function";
}

function getModelErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Model date recognition failed";
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!isUploadedFile(file)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const result = await recognizePackageDateWithVision({
      apiKey,
      imageBase64: bytes.toString("base64"),
      mimeType: file.type || "image/jpeg",
      proxyUrl: process.env.OPENAI_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "MODEL_DATE_RECOGNITION_FAILED",
        message: getModelErrorMessage(error),
      },
      { status: 502 },
    );
  }
}