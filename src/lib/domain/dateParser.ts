import { addMonths, format, lastDayOfMonth } from "date-fns";

export type ParsedPackageDate = {
  expiresAt: string;
  confidence: "high" | "medium" | "low";
  source: "explicit-expiry" | "production-plus-shelf-life" | "unknown";
};

type ReadDateOptions = {
  monthOnlyAsEndOfMonth?: boolean;
};

function toDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day);
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
    return !separated[3] && options.monthOnlyAsEndOfMonth ? lastDayOfMonth(date) : date;
  }

  return null;
}

function readDateAfterKeywords(text: string, keywords: RegExp, options: ReadDateOptions = {}) {
  const match = text.match(keywords);
  if (!match?.index && match?.index !== 0) return null;
  return readDate(text.slice(match.index), options);
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

  return { expiresAt: format(baseDate, "yyyy-MM-dd"), confidence: "low", source: "unknown" };
}
