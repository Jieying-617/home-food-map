import { addMonths, format, lastDayOfMonth } from "date-fns";

export type ParsedPackageDate = {
  expiresAt: string;
  confidence: "high" | "medium" | "low";
  source: "explicit-expiry" | "production-plus-shelf-life" | "ocr-expiry-candidate" | "unknown";
};

type ReadDateOptions = {
  monthOnlyAsEndOfMonth?: boolean;
};

function toDate(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function readDate(text: string, options: ReadDateOptions = {}): Date | null {
  const chinese = text.match(/(20\d{2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*(日|号)?/);
  if (chinese) return toDate(Number(chinese[1]), Number(chinese[2]), Number(chinese[3]));

  const compact = text.match(/(?<!\d)(20\d{2})(\d{2})(\d{2})(?!\d)/);
  if (compact) return toDate(Number(compact[1]), Number(compact[2]), Number(compact[3]));

  const separated = text.match(/(20\d{2})\s*[.\-/]\s*(\d{1,2})(?:\s*[.\-/]\s*(\d{1,2}))?/);
  if (separated) {
    const year = Number(separated[1]);
    const month = Number(separated[2]);
    const day = separated[3] ? Number(separated[3]) : 1;
    const date = toDate(year, month, day);
    if (!date) return null;
    return !separated[3] && options.monthOnlyAsEndOfMonth ? lastDayOfMonth(date) : date;
  }

  return null;
}

function readDateAfterKeywords(text: string, keywords: RegExp, options: ReadDateOptions = {}) {
  const match = text.match(keywords);
  if (!match?.index && match?.index !== 0) return null;
  return readDate(text.slice(match.index), options);
}

function findOcrExpiryCandidate(text: string, baseDate: Date) {
  const candidates: Date[] = [];
  const compactMatches = text.matchAll(/(?<!\d)(20\d{2})(\d{2})(\d{2})(?!\d)/g);
  for (const match of compactMatches) {
    const date = toDate(Number(match[1]), Number(match[2]), Number(match[3]));
    if (date && date > baseDate) candidates.push(date);
  }

  const separatedMatches = text.matchAll(/(20\d{2})\s*[.\-/]\s*(\d{1,2})(?:\s*[.\-/]\s*(\d{1,2}))?/g);
  for (const match of separatedMatches) {
    const year = Number(match[1]);
    const monthText = match[2];
    const dayText = match[3];
    if (!dayText && monthText.length < 2) continue;

    const date = toDate(year, Number(monthText), dayText ? Number(dayText) : 1);
    if (date && date > baseDate) candidates.push(dayText ? date : lastDayOfMonth(date));
  }

  return candidates.sort((a, b) => b.getTime() - a.getTime())[0] ?? null;
}

export function parsePackageDate(text: string, baseDate: Date): ParsedPackageDate {
  const normalized = text.replace(/\s+/g, "");
  if (/有效期至|有效期】至|保质期至|到期日|有效期/.test(normalized)) {
    const date = readDateAfterKeywords(normalized, /有效期至|有效期】至|保质期至|到期日|有效期/, {
      monthOnlyAsEndOfMonth: true,
    });
    if (date) return { expiresAt: format(date, "yyyy-MM-dd"), confidence: "high", source: "explicit-expiry" };
  }

  const productionDate = readDateAfterKeywords(normalized, /生产日期|生产/, { monthOnlyAsEndOfMonth: false }) ?? readDate(normalized);
  const months = normalized.match(/保质期(\d{1,2})个月/);
  if (productionDate && months) {
    return {
      expiresAt: format(addMonths(productionDate, Number(months[1])), "yyyy-MM-dd"),
      confidence: "medium",
      source: "production-plus-shelf-life",
    };
  }

  const ocrExpiryCandidate = findOcrExpiryCandidate(text, baseDate);
  if (ocrExpiryCandidate) {
    return {
      expiresAt: format(ocrExpiryCandidate, "yyyy-MM-dd"),
      confidence: "medium",
      source: "ocr-expiry-candidate",
    };
  }

  return { expiresAt: format(baseDate, "yyyy-MM-dd"), confidence: "low", source: "unknown" };
}
