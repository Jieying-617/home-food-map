import { beforeEach, describe, expect, it, vi } from "vitest";

const configuredMock = vi.hoisted(() => vi.fn());
const generateMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/server/locationCoverComfy", () => ({
  isComfyLocationCoverConfigured: configuredMock,
  generateLocationCoverWithComfy: generateMock,
}));

describe("POST /api/generate-location-cover", () => {
  beforeEach(() => {
    vi.resetModules();
    configuredMock.mockReset();
    generateMock.mockReset();
  });

  it("requires an uploaded image file", async () => {
    const { POST } = await import("@/app/api/generate-location-cover/route");
    const response = await POST(new Request("http://localhost/api/generate-location-cover", { method: "POST", body: new FormData() }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "missing file" });
  });

  it("returns a readable not-configured response when ComfyUI is disabled", async () => {
    configuredMock.mockReturnValue(false);
    const { POST } = await import("@/app/api/generate-location-cover/route");
    const form = new FormData();
    form.append("file", new File(["image"], "cabinet.webp", { type: "image/webp" }));

    const response = await POST(new Request("http://localhost/api/generate-location-cover", { method: "POST", body: form }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: "LOCATION_COVER_GENERATION_NOT_CONFIGURED",
    });
    expect(generateMock).not.toHaveBeenCalled();
  });

  it("returns the generated image payload from ComfyUI", async () => {
    configuredMock.mockReturnValue(true);
    generateMock.mockResolvedValue({
      provider: "comfyui",
      imageBase64: "AQID",
      mimeType: "image/png",
      filename: "cartoon-cabinet.png",
    });
    const { POST } = await import("@/app/api/generate-location-cover/route");
    const form = new FormData();
    form.append("file", new File(["image"], "cabinet.webp", { type: "image/webp" }));

    const response = await POST(new Request("http://localhost/api/generate-location-cover", { method: "POST", body: form }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      provider: "comfyui",
      imageBase64: "AQID",
      mimeType: "image/png",
    });
    expect(generateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        imageBytes: expect.any(Buffer),
        mimeType: "image/webp",
        filename: expect.any(String),
      }),
    );
  });
});

