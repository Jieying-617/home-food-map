import { format } from "date-fns";

const chineseNumbers: Record<string, number> = {
  一: 1,
  两: 2,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
};

export type ParsedVoiceEntry = {
  name: string;
  quantity: number;
  unit: string;
  locationName: string;
  expiresAt: string;
  missing: Array<"name" | "quantity" | "location" | "expiresAt">;
};

export function parseVoiceEntry(text: string, knownLocations: string[], baseDate: Date): ParsedVoiceEntry {
  const locationName = knownLocations.find((location) => text.includes(location)) ?? "";
  const quantityMatch = text.match(/([一两二三四五六七八九十\d]+)\s*(包|袋|盒|箱|瓶|罐|个|斤)/);
  const dateMatch = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*(号|日)?/);
  const quantityText = quantityMatch?.[1] ?? "";
  const quantity = /^\d+$/.test(quantityText) ? Number(quantityText) : chineseNumbers[quantityText] ?? 1;
  const unit = quantityMatch?.[2] ?? "件";
  const expiresAt = dateMatch
    ? format(new Date(baseDate.getFullYear(), Number(dateMatch[1]) - 1, Number(dateMatch[2])), "yyyy-MM-dd")
    : "";
  const afterQuantity = quantityMatch ? text.slice((quantityMatch.index ?? 0) + quantityMatch[0].length) : text;
  const name = afterQuantity
    .replace(/[,，。.\s]/g, "")
    .replace(/\d{1,2}月\d{1,2}(号|日)?(到期|前吃完)?.*$/, "")
    .replace(/到期.*$/, "")
    .replace(/前吃完.*$/, "") || "";

  const missing: ParsedVoiceEntry["missing"] = [];
  if (!name) missing.push("name");
  if (!quantity) missing.push("quantity");
  if (!locationName) missing.push("location");
  if (!expiresAt) missing.push("expiresAt");

  return { name, quantity, unit, locationName, expiresAt, missing };
}
