import { recognize } from "tesseract.js";

export async function recognizeDateText(file: File): Promise<string> {
  const result = await recognize(file, "chi_sim+eng");
  return result.data.text;
}
