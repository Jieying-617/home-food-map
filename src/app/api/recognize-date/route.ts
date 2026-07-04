import { NextResponse } from "next/server";
import { recognizePackageDateWithVision } from "@/lib/server/dateVision";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await recognizePackageDateWithVision({
    apiKey,
    imageBase64: bytes.toString("base64"),
    mimeType: file.type || "image/jpeg",
  });

  return NextResponse.json(result);
}
