import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { ProxyAgent } from "undici";

type FetchWithDispatcher = (url: string, init?: RequestInit & { dispatcher?: unknown }) => Promise<Response>;

type ComfyUploadResult = {
  name?: string;
  subfolder?: string;
  type?: string;
};

type ComfyImageOutput = {
  filename?: string;
  subfolder?: string;
  type?: string;
};

export type LocationCoverGenerationResult = {
  provider: "comfyui";
  imageBase64: string;
  mimeType: string;
  filename: string;
};

export type GenerateLocationCoverWithComfyInput = {
  imageBytes: Buffer;
  mimeType: string;
  filename: string;
  baseUrl?: string | null;
  workflowPath?: string | null;
  prompt?: string;
  negativePrompt?: string;
  seed?: number;
  clientId?: string;
  proxyUrl?: string | null;
  fetchImpl?: FetchWithDispatcher;
  readWorkflowFile?: (workflowPath: string) => Promise<string>;
  proxyAgentFactory?: (proxyUrl: string) => unknown;
  sleep?: (milliseconds: number) => Promise<void>;
  maxAttempts?: number;
};

const DEFAULT_PROMPT =
  "Create a clean cute cartoon illustration of the storage cabinet in the reference photo. Preserve the cabinet shape, drawer count, handle positions, main color, and front-facing structure. Remove background clutter, people, text, lamps, plants, beds, wall art, and unrelated objects. Use a warm flat illustration style with clear outlines, soft natural colors, tidy 4:3 composition, no labels, no watermark.";

const DEFAULT_NEGATIVE_PROMPT =
  "photorealistic, messy background, red block, solid color rectangle, text, watermark, logo, person, animal, distorted cabinet, extra drawers, missing handles, low quality, blurry";

function normalizeBaseUrl(baseUrl?: string | null) {
  const value = baseUrl?.trim();
  if (!value) return null;
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeWorkflowPath(workflowPath?: string | null) {
  const value = workflowPath?.trim();
  return value || null;
}

function normalizeProxyUrl(proxyUrl?: string | null) {
  const value = proxyUrl?.trim();
  return value || null;
}

export function isComfyLocationCoverConfigured({
  baseUrl = process.env.COMFYUI_BASE_URL,
  workflowPath = process.env.COMFYUI_WORKFLOW_PATH,
}: {
  baseUrl?: string | null;
  workflowPath?: string | null;
} = {}) {
  return Boolean(normalizeBaseUrl(baseUrl) && normalizeWorkflowPath(workflowPath));
}

function makeUrl(baseUrl: string, pathname: string, params?: Record<string, string>) {
  const url = new URL(pathname, baseUrl);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

function withDispatcher(init: RequestInit, proxyUrl: string | null, proxyAgentFactory: (proxyUrl: string) => unknown) {
  if (!proxyUrl) return init as RequestInit & { dispatcher?: unknown };
  return { ...init, dispatcher: proxyAgentFactory(proxyUrl) };
}

function sanitizeFilename(filename: string) {
  const clean = filename.replace(/[^a-zA-Z0-9_.-]/g, "-");
  return clean || "location-cover.png";
}

function replaceWorkflowPlaceholders(value: unknown, replacements: Record<string, string | number>): unknown {
  if (typeof value === "string") {
    if (Object.prototype.hasOwnProperty.call(replacements, value)) return replacements[value];
    return Object.entries(replacements).reduce(
      (current, [placeholder, replacement]) => current.replaceAll(placeholder, String(replacement)),
      value,
    );
  }

  if (Array.isArray(value)) return value.map((item) => replaceWorkflowPlaceholders(item, replacements));

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, childValue]) => [key, replaceWorkflowPlaceholders(childValue, replacements)]),
    );
  }

  return value;
}

async function uploadInputImage({
  baseUrl,
  imageBytes,
  mimeType,
  filename,
  fetchImpl,
  requestInit,
}: {
  baseUrl: string;
  imageBytes: Buffer;
  mimeType: string;
  filename: string;
  fetchImpl: FetchWithDispatcher;
  requestInit: RequestInit & { dispatcher?: unknown };
}) {
  const imagePayload = new Uint8Array(imageBytes.byteLength);
  imagePayload.set(imageBytes);

  const form = new FormData();
  form.append("image", new Blob([imagePayload], { type: mimeType }), sanitizeFilename(filename));
  form.append("type", "input");
  form.append("overwrite", "true");

  const response = await fetchImpl(makeUrl(baseUrl, "/upload/image"), { ...requestInit, method: "POST", body: form });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`ComfyUI image upload failed: ${response.status} ${detail}`.trim());
  }

  const json = (await response.json()) as ComfyUploadResult;
  if (!json.name) throw new Error("ComfyUI image upload returned no image name");
  return json.name;
}

async function submitPrompt({
  baseUrl,
  workflow,
  clientId,
  fetchImpl,
  requestInit,
}: {
  baseUrl: string;
  workflow: unknown;
  clientId: string;
  fetchImpl: FetchWithDispatcher;
  requestInit: RequestInit & { dispatcher?: unknown };
}) {
  const response = await fetchImpl(makeUrl(baseUrl, "/prompt"), {
    ...requestInit,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, prompt: workflow }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`ComfyUI prompt submission failed: ${response.status} ${detail}`.trim());
  }

  const json = (await response.json()) as { prompt_id?: string };
  if (!json.prompt_id) throw new Error("ComfyUI prompt submission returned no prompt id");
  return json.prompt_id;
}

function findFirstGeneratedImage(historyJson: unknown, promptId: string): ComfyImageOutput | null {
  if (!historyJson || typeof historyJson !== "object") return null;
  const root = historyJson as Record<string, unknown>;
  const promptHistory = (root[promptId] ?? historyJson) as { outputs?: Record<string, { images?: ComfyImageOutput[] }> };

  for (const output of Object.values(promptHistory.outputs ?? {})) {
    const image = output.images?.find((item) => item.filename);
    if (image) return image;
  }

  return null;
}

async function waitForGeneratedImage({
  baseUrl,
  promptId,
  fetchImpl,
  requestInit,
  sleep,
  maxAttempts,
}: {
  baseUrl: string;
  promptId: string;
  fetchImpl: FetchWithDispatcher;
  requestInit: RequestInit & { dispatcher?: unknown };
  sleep: (milliseconds: number) => Promise<void>;
  maxAttempts: number;
}) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const response = await fetchImpl(makeUrl(baseUrl, `/history/${promptId}`), requestInit);
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`ComfyUI history request failed: ${response.status} ${detail}`.trim());
    }

    const image = findFirstGeneratedImage(await response.json(), promptId);
    if (image) return image;
    await sleep(1200);
  }

  throw new Error("ComfyUI cover generation timed out");
}

function filenameToMimeType(filename: string) {
  if (/\.jpe?g$/i.test(filename)) return "image/jpeg";
  if (/\.webp$/i.test(filename)) return "image/webp";
  return "image/png";
}

async function downloadGeneratedImage({
  baseUrl,
  image,
  fetchImpl,
  requestInit,
}: {
  baseUrl: string;
  image: ComfyImageOutput;
  fetchImpl: FetchWithDispatcher;
  requestInit: RequestInit & { dispatcher?: unknown };
}): Promise<LocationCoverGenerationResult> {
  const filename = image.filename ?? "location-cover.png";
  const response = await fetchImpl(
    makeUrl(baseUrl, "/view", {
      filename,
      subfolder: image.subfolder ?? "",
      type: image.type ?? "output",
    }),
    requestInit,
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`ComfyUI image download failed: ${response.status} ${detail}`.trim());
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  return {
    provider: "comfyui",
    imageBase64: bytes.toString("base64"),
    mimeType: response.headers.get("content-type") ?? filenameToMimeType(filename),
    filename,
  };
}

export async function generateLocationCoverWithComfy({
  imageBytes,
  mimeType,
  filename,
  baseUrl = process.env.COMFYUI_BASE_URL,
  workflowPath = process.env.COMFYUI_WORKFLOW_PATH,
  prompt = process.env.COMFYUI_LOCATION_COVER_PROMPT ?? DEFAULT_PROMPT,
  negativePrompt = process.env.COMFYUI_LOCATION_COVER_NEGATIVE_PROMPT ?? DEFAULT_NEGATIVE_PROMPT,
  seed = Math.floor(Math.random() * 1_000_000_000),
  clientId = randomUUID(),
  proxyUrl = process.env.COMFYUI_PROXY_URL,
  fetchImpl = fetch,
  readWorkflowFile = (path: string) => readFile(path, "utf8"),
  proxyAgentFactory = (url: string) => new ProxyAgent(url),
  sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  maxAttempts = 80,
}: GenerateLocationCoverWithComfyInput): Promise<LocationCoverGenerationResult> {
  const configuredBaseUrl = normalizeBaseUrl(baseUrl);
  if (!configuredBaseUrl) throw new Error("ComfyUI location cover generation is not configured: missing COMFYUI_BASE_URL");

  const configuredWorkflowPath = normalizeWorkflowPath(workflowPath);
  if (!configuredWorkflowPath) throw new Error("ComfyUI location cover generation is not configured: missing COMFYUI_WORKFLOW_PATH");

  const configuredProxyUrl = normalizeProxyUrl(proxyUrl);
  const requestInit = withDispatcher({}, configuredProxyUrl, proxyAgentFactory);
  const uploadedImageName = await uploadInputImage({
    baseUrl: configuredBaseUrl,
    imageBytes,
    mimeType,
    filename,
    fetchImpl,
    requestInit,
  });

  const workflow = replaceWorkflowPlaceholders(JSON.parse(await readWorkflowFile(configuredWorkflowPath)), {
    __INPUT_IMAGE__: uploadedImageName,
    __PROMPT__: prompt,
    __NEGATIVE_PROMPT__: negativePrompt,
    __SEED__: seed,
  });

  const promptId = await submitPrompt({
    baseUrl: configuredBaseUrl,
    workflow,
    clientId,
    fetchImpl,
    requestInit,
  });
  const generatedImage = await waitForGeneratedImage({
    baseUrl: configuredBaseUrl,
    promptId,
    fetchImpl,
    requestInit,
    sleep,
    maxAttempts,
  });

  return downloadGeneratedImage({ baseUrl: configuredBaseUrl, image: generatedImage, fetchImpl, requestInit });
}



