import { addMonths, format } from "date-fns";

export type ParsedPackageDate = {
  expiresAt: string;
  confidence: "high" | "medium" | "low";
  source: "explicit-expiry" | "production-plus-shelf-life" | "unknown";
};

function readChineseDate(text: string): Date | null {
  const match = text.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*(日|号)?/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

export function parsePackageDate(text: string, baseDate: Date): ParsedPackageDate {
  const normalized = text.replace(/\s+/g, "");
  if (/有效期至|保质期至|到期日/.test(normalized)) {
    const date = readChineseDate(normalized);
    if (date) return { expiresAt: format(date, "yyyy-MM-dd"), confidence: "high", source: "explicit-expiry" };
  }

  const productionDate = readChineseDate(normalized);
  const months = normalized.match(/保质期(\d{1,2})个月/);
  if (productionDate && months) {
    return {
      expiresAt: format(addMonths(productionDate, Number(months[1])), "yyyy-MM-dd"),
      confidence: "medium",
      source: "production-plus-shelf-life",
    };
  }

  return { expiresAt: format(baseDate, "yyyy-MM-dd"), confidence: "low", source: "unknown" };
}
