import { differenceInCalendarDays, parseISO } from "date-fns";
import type { FoodSummary } from "./types";

export type ExpiryGroups = {
  expired: FoodSummary[];
  today: FoodSummary[];
  within3Days: FoodSummary[];
  within7Days: FoodSummary[];
  within30Days: FoodSummary[];
  later: FoodSummary[];
};

export type ExpiryNotice = {
  days: number;
  label: string;
  tone: "expired" | "today" | "soon" | "warning" | "normal" | "later";
};

export function daysUntilExpiry(expiresAt: string, today: Date): number {
  return differenceInCalendarDays(parseISO(expiresAt), today);
}

export function getExpiryNotice(expiresAt: string, today: Date): ExpiryNotice {
  const days = daysUntilExpiry(expiresAt, today);
  if (days < 0) return { days, label: `已过期 ${Math.abs(days)} 天`, tone: "expired" };
  if (days === 0) return { days, label: "今天到期", tone: "today" };
  if (days <= 3) return { days, label: `还有 ${days} 天`, tone: "soon" };
  if (days <= 7) return { days, label: `还有 ${days} 天`, tone: "warning" };
  if (days <= 30) return { days, label: `还有 ${days} 天`, tone: "normal" };
  return { days, label: `${days} 天后`, tone: "later" };
}

export function groupExpiry(items: FoodSummary[], today: Date): ExpiryGroups {
  const groups: ExpiryGroups = {
    expired: [],
    today: [],
    within3Days: [],
    within7Days: [],
    within30Days: [],
    later: [],
  };

  for (const item of items) {
    if (item.status !== "active") continue;
    const days = daysUntilExpiry(item.expiresAt, today);
    if (days < 0) groups.expired.push(item);
    else if (days === 0) groups.today.push(item);
    else if (days <= 3) groups.within3Days.push(item);
    else if (days <= 7) groups.within7Days.push(item);
    else if (days <= 30) groups.within30Days.push(item);
    else groups.later.push(item);
  }

  return groups;
}
