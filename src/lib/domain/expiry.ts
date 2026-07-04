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

export type ExpirySummary = {
  expiredCount: number;
  todayCount: number;
  within7DaysCount: number;
  within30DaysCount: number;
  urgentCount: number;
  totalReminderCount: number;
  headline: string;
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

export function summarizeExpiry(groups: ExpiryGroups): ExpirySummary {
  const expiredCount = groups.expired.length;
  const todayCount = groups.today.length;
  const within7DaysCount = groups.within3Days.length + groups.within7Days.length;
  const within30DaysCount = groups.within30Days.length;
  const urgentCount = expiredCount + todayCount + within7DaysCount;
  const totalReminderCount = urgentCount + within30DaysCount;

  let headline = "目前没有需要处理的到期提醒";
  if (expiredCount > 0) headline = `${expiredCount} 件已过期，先检查能不能处理`;
  else if (todayCount > 0) headline = `${todayCount} 件今天到期，今天优先处理`;
  else if (within7DaysCount > 0) headline = `${within7DaysCount} 件 7 天内到期，提前安排一下`;
  else if (within30DaysCount > 0) headline = `${within30DaysCount} 件 30 天内到期，别放到忘记`;

  return {
    expiredCount,
    todayCount,
    within7DaysCount,
    within30DaysCount,
    urgentCount,
    totalReminderCount,
    headline,
  };
}
