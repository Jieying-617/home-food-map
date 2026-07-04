import { recognize } from "tesseract.js";

export type VisionDateResult = {
  productionDate: string | null;
  expiryDate: string | null;
  batchNumber: string | null;
  confidence: "high" | "medium" | "low";
  rawText: string;
  explanation: string;
};

type OcrInput = File | Blob;

type OcrResult = {
  data: {
    text: string;
  };
};

type RecognizeDateTextOptions = {
  createInputs?: (file: File) => Promise<OcrInput[]>;
  recognizeImpl?: (image: OcrInput, langs: string) => Promise<OcrResult>;
};

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

async function renderOcrVariant(file: File, crop?: { y: number; height: number }) {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") return null;

  const bitmap = await createImageBitmap(file);
  const sourceY = crop ? Math.floor(bitmap.height * crop.y) : 0;
  const sourceHeight = crop ? Math.floor(bitmap.height * crop.height) : bitmap.height;
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = sourceHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;

  context.drawImage(bitmap, 0, sourceY, bitmap.width, sourceHeight, 0, 0, bitmap.width, sourceHeight);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = image.data[index] * 0.299 + image.data[index + 1] * 0.587 + image.data[index + 2] * 0.114;
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.8 + 128));
    const value = contrasted > 145 ? 255 : 0;
    image.data[index] = value;
    image.data[index + 1] = value;
    image.data[index + 2] = value;
  }
  context.putImageData(image, 0, 0);
  return canvasToBlob(canvas);
}

async function createLocalOcrInputs(file: File): Promise<OcrInput[]> {
  const variants: OcrInput[] = [file];
  try {
    const fullEnhanced = await renderOcrVariant(file);
    const dateBand = await renderOcrVariant(file, { y: 0.35, height: 0.35 });
    if (fullEnhanced) variants.push(fullEnhanced);
    if (dateBand) variants.push(dateBand);
  } catch {
    // Keep the original image path when browser-side preprocessing is unavailable.
  }
  return variants;
}

function combineOcrTexts(texts: string[]) {
  const uniqueTexts = texts.map((text) => text.trim()).filter(Boolean);
  return Array.from(new Set(uniqueTexts)).join("\n\n");
}

export async function recognizeDateText(file: File, options: RecognizeDateTextOptions = {}): Promise<string> {
  const inputs = await (options.createInputs ?? createLocalOcrInputs)(file);
  const recognizeImpl = options.recognizeImpl ?? recognize;
  const texts = [];

  for (const input of inputs) {
    const result = await recognizeImpl(input, "chi_sim+eng");
    texts.push(result.data.text);
  }

  return combineOcrTexts(texts);
}

async function readModelError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { message?: unknown; error?: unknown };
    if (typeof data.message === "string" && data.message.trim()) return data.message;
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  } catch {
    // Keep the fallback below when the server returned non-JSON.
  }
  return "大模型日期识别暂不可用";
}

export async function recognizeDateByVision(file: File): Promise<VisionDateResult> {
  const form = new FormData();
  form.append("file", file, file.name);
  const response = await fetch("/api/recognize-date", { method: "POST", body: form });
  if (!response.ok) throw new Error(await readModelError(response));
  return (await response.json()) as VisionDateResult;
}
