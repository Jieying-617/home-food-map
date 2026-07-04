import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatePhotoPanel } from "@/components/add/DatePhotoPanel";
import { recognizeDateByVision, recognizeDateText } from "@/lib/adapters/ocr";

vi.mock("@/lib/adapters/ocr", () => ({
  recognizeDateByVision: vi.fn(),
  recognizeDateText: vi.fn(),
}));

function uploadImage() {
  const file = new File(["date"], "date.jpg", { type: "image/jpeg" });
  const input = screen.getByLabelText("上传日期照片");
  fireEvent.change(input, { target: { files: [file] } });
}

describe("DatePhotoPanel", () => {
  it("uses model vision result before local OCR", async () => {
    vi.mocked(recognizeDateByVision).mockResolvedValue({
      productionDate: "2026-01-13",
      expiryDate: "2027-12-31",
      batchNumber: "20260101",
      confidence: "high",
      rawText: "产品批号 20260101 生产日期 20260113 有效期至 2027.12",
      explanation: "有效期只标到年月，按该月最后一天处理。",
    });

    render(<DatePhotoPanel familyId="demo" locations={[{ id: "loc-1", name: "妈妈零食柜" }]} />);
    uploadImage();

    expect(await screen.findByText("已识别日期，请确认后保存")).toBeVisible();
    expect(screen.getByText("识别原文（大模型识别）")).toBeVisible();
    expect(screen.getByText(/2027\.12/)).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText("到期日")).toHaveValue("2027-12-31"));
    expect(recognizeDateText).not.toHaveBeenCalled();
  });

  it("falls back to OCR and fills compact expiry month for confirmation", async () => {
    vi.mocked(recognizeDateByVision).mockRejectedValue(new Error("no api key"));
    vi.mocked(recognizeDateText).mockResolvedValue("【产品批号】20260101 【生产日期】20260113 030 【有效期】至 2027.12.");

    render(<DatePhotoPanel familyId="demo" locations={[{ id: "loc-1", name: "妈妈零食柜" }]} />);
    uploadImage();

    expect(await screen.findByText("本地 OCR 已提取日期，请仔细确认后保存")).toBeVisible();
    expect(screen.getByText("识别原文（本地 OCR）")).toBeVisible();
    expect(screen.getByText(/大模型识别暂不可用/)).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText("到期日")).toHaveValue("2027-12-31"));
  });

  it("leaves expiry date empty when OCR text has no reliable date", async () => {
    vi.mocked(recognizeDateByVision).mockRejectedValue(new Error("no api key"));
    vi.mocked(recognizeDateText).mockResolvedValue("模糊文字 看不清日期");

    render(<DatePhotoPanel familyId="demo" locations={[{ id: "loc-1", name: "妈妈零食柜" }]} />);
    uploadImage();

    expect(await screen.findByText("日期不太确定，请手动选择到期日"));
    await waitFor(() => expect(screen.getByLabelText("到期日")).toHaveValue(""));
  });

  it("shows billing guidance when model quota is exhausted", async () => {
    vi.mocked(recognizeDateByVision).mockRejectedValue(new Error("OpenAI date recognition failed: 429 insufficient_quota"));
    vi.mocked(recognizeDateText).mockResolvedValue("【有效期】至 2027.12.");

    render(<DatePhotoPanel familyId="demo" locations={[{ id: "loc-1", name: "妈妈零食柜" }]} />);
    uploadImage();

    expect(await screen.findByText(/OpenAI API 额度不足/)).toBeVisible();
    expect(screen.getByText(/检查账号计费或充值/)).toBeVisible();
  });
});
