import { NextResponse } from "next/server";
import { recognizePackageDateWithGemini } from "@/lib/server/dateVisionGemini";
import { recognizePackageDateWithOpenRouter } from "@/lib/server/dateVisionOpenRouter";
import { recognizePackageDateWithVision } from "@/lib/server/dateVision";

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return typeof value === "object" && value !== null && "arrayBuffer" in value && typeof value.arrayBuffer === "function";
}

function getModelErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Model date recognition failed";
}

function getProxyUrl(provider: "openrouter" | "gemini" | "openai") {
  if (provider === "openrouter") return process.env.OPENROUTER_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
  if (provider === "gemini") return process.env.GEMINI_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
  return process.env.OPENAI_PROXY_URL ?? process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
}

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!isUploadedFile(file)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const imageBase64 = bytes.toString("base64");
  const mimeType = file.type || "image/jpeg";
  const errors: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const result = await recognizePackageDateWithGemini({
        apiKey: process.env.GEMINI_API_KEY,
        imageBase64,
        mimeType,
        proxyUrl: getProxyUrl("gemini"),
      });
      return NextResponse.json(result);
    } catch (error) {
      errors.push(getModelErrorMessage(error));
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    try {
      const result = await recognizePackageDateWithOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
        imageBase64,
        mimeType,
        proxyUrl: getProxyUrl("openrouter"),
      });
      return NextResponse.json(result);
    } catch (error) {
      errors.push(getModelErrorMessage(error));
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await recognizePackageDateWithVision({
        apiKey: process.env.OPENAI_API_KEY,
        imageBase64,
        mimeType,
        proxyUrl: getProxyUrl("openai"),
      });
      return NextResponse.json(result);
    } catch (error) {
      errors.push(getModelErrorMessage(error));
    }
  }

  return NextResponse.json(
    {
      error: "MODEL_DATE_RECOGNITION_FAILED",
      message: errors.length ? errors.join("；") : "No model date recognition provider is configured",
    },
    { status: errors.length ? 502 : 503 },
  );
}
