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

export function daysUntilExpiry(expiresAt: string, today: Date): number {
  return differenceInCalendarDays(parseISO(expiresAt), today);
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
