import { describe, expect, it, vi } from "vitest";
import { generateLocationCoverWithComfy, isComfyLocationCoverConfigured } from "@/lib/server/locationCoverComfy";

describe("location cover ComfyUI provider", () => {
  it("requires both a ComfyUI base URL and workflow path", () => {
    expect(isComfyLocationCoverConfigured({ baseUrl: "http://127.0.0.1:8188", workflowPath: "workflow.json" })).toBe(true);
    expect(isComfyLocationCoverConfigured({ baseUrl: "", workflowPath: "workflow.json" })).toBe(false);
    expect(isComfyLocationCoverConfigured({ baseUrl: "http://127.0.0.1:8188", workflowPath: "" })).toBe(false);
  });

  it("uploads the reference image, replaces workflow placeholders, and returns the generated image", async () => {
    const fetchImpl = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
    fetchImpl
      .mockResolvedValueOnce(Response.json({ name: "input-cabinet.webp" }))
      .mockResolvedValueOnce(Response.json({ prompt_id: "prompt-1" }))
      .mockResolvedValueOnce(Response.json({ "prompt-1": { outputs: {} } }))
      .mockResolvedValueOnce(
        Response.json({
          "prompt-1": {
            outputs: {
              "9": {
                images: [{ filename: "cartoon-cabinet.png", subfolder: "", type: "output" }],
              },
            },
          },
        }),
      )
      .mockResolvedValueOnce(new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "image/png" } }));

    const workflow = {
      "1": { class_type: "LoadImage", inputs: { image: "__INPUT_IMAGE__" } },
      "2": { class_type: "CLIPTextEncode", inputs: { text: "__PROMPT__" } },
      "3": { class_type: "CLIPTextEncode", inputs: { text: "__NEGATIVE_PROMPT__" } },
      "4": { class_type: "KSampler", inputs: { seed: "__SEED__" } },
    };

    const result = await generateLocationCoverWithComfy({
      imageBytes: Buffer.from("image"),
      mimeType: "image/webp",
      filename: "cabinet.webp",
      baseUrl: "http://127.0.0.1:8188",
      workflowPath: "D:/workflow.json",
      prompt: "cartoon cabinet",
      negativePrompt: "bad",
      seed: 617,
      clientId: "client-1",
      proxyUrl: null,
      fetchImpl,
      readWorkflowFile: vi.fn().mockResolvedValue(JSON.stringify(workflow)),
      sleep: vi.fn().mockResolvedValue(undefined),
      maxAttempts: 3,
    });

    expect(result).toEqual({
      provider: "comfyui",
      imageBase64: "AQID",
      mimeType: "image/png",
      filename: "cartoon-cabinet.png",
    });

    expect(fetchImpl.mock.calls[0][0]).toBe("http://127.0.0.1:8188/upload/image");
    expect(fetchImpl.mock.calls[1][0]).toBe("http://127.0.0.1:8188/prompt");
    const promptBody = JSON.parse(String((fetchImpl.mock.calls[1][1] as RequestInit).body));
    expect(promptBody.prompt["1"].inputs.image).toBe("input-cabinet.webp");
    expect(promptBody.prompt["2"].inputs.text).toBe("cartoon cabinet");
    expect(promptBody.prompt["3"].inputs.text).toBe("bad");
    expect(promptBody.prompt["4"].inputs.seed).toBe(617);
    expect(fetchImpl.mock.calls[4][0]).toBe("http://127.0.0.1:8188/view?filename=cartoon-cabinet.png&type=output");
  });

  it("times out when ComfyUI never returns an output image", async () => {
    const fetchImpl = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
    fetchImpl
      .mockResolvedValueOnce(Response.json({ name: "input-cabinet.webp" }))
      .mockResolvedValueOnce(Response.json({ prompt_id: "prompt-1" }))
      .mockImplementation(() => Promise.resolve(Response.json({ "prompt-1": { outputs: {} } })));

    await expect(
      generateLocationCoverWithComfy({
        imageBytes: Buffer.from("image"),
        mimeType: "image/webp",
        filename: "cabinet.webp",
        baseUrl: "http://127.0.0.1:8188",
        workflowPath: "D:/workflow.json",
        proxyUrl: null,
        fetchImpl,
        readWorkflowFile: vi.fn().mockResolvedValue("{}"),
        sleep: vi.fn().mockResolvedValue(undefined),
        maxAttempts: 2,
      }),
    ).rejects.toThrow("ComfyUI cover generation timed out");
  });

  it("does not inherit global HTTP proxies unless COMFYUI_PROXY_URL is provided", async () => {
    vi.stubEnv("HTTP_PROXY", "http://127.0.0.1:7897");
    vi.stubEnv("HTTPS_PROXY", "http://127.0.0.1:7897");
    vi.stubEnv("COMFYUI_PROXY_URL", "");
    const proxyAgentFactory = vi.fn();
    const fetchImpl = vi.fn<Parameters<typeof fetch>, ReturnType<typeof fetch>>();
    fetchImpl
      .mockResolvedValueOnce(Response.json({ name: "input-cabinet.webp" }))
      .mockResolvedValueOnce(Response.json({ prompt_id: "prompt-1" }))
      .mockResolvedValueOnce(
        Response.json({
          "prompt-1": {
            outputs: {
              "9": {
                images: [{ filename: "cartoon-cabinet.png", subfolder: "", type: "output" }],
              },
            },
          },
        }),
      )
      .mockResolvedValueOnce(new Response(new Uint8Array([1]), { headers: { "content-type": "image/png" } }));

    await generateLocationCoverWithComfy({
      imageBytes: Buffer.from("image"),
      mimeType: "image/webp",
      filename: "cabinet.webp",
      baseUrl: "http://127.0.0.1:8188",
      workflowPath: "D:/workflow.json",
      proxyUrl: process.env.COMFYUI_PROXY_URL,
      proxyAgentFactory,
      fetchImpl,
      readWorkflowFile: vi.fn().mockResolvedValue("{}"),
      sleep: vi.fn().mockResolvedValue(undefined),
      maxAttempts: 1,
    });

    expect(proxyAgentFactory).not.toHaveBeenCalled();
  });
});


