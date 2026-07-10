import { differenceInCalendarDays } from "date-fns";

export type LocationOverviewLocation = {
  id: string;
  name: string;
  foods: Array<{
    name: string;
    expiresAt: Date;
  }>;
};

export type LocationRouteItem = {
  locationId: string;
  locationName: string;
  foodName: string;
  expiresAt: Date;
  days: number;
  riskLabel: "已过期" | "今天到期" | "7 天内" | "30 天内" | "很安心";
};

export type LocationOverview = {
  totalFoods: number;
  priorityCount: number;
  routeItems: LocationRouteItem[];
};

function getRiskLabel(days: number): LocationRouteItem["riskLabel"] {
  if (days < 0) return "已过期";
  if (days === 0) return "今天到期";
  if (days <= 7) return "7 天内";
  if (days <= 30) return "30 天内";
  return "很安心";
}

export function buildLocationOverview(
  locations: LocationOverviewLocation[],
  today: Date,
): LocationOverview {
  const allItems = locations.flatMap((location) =>
    location.foods.map((food) => {
      const days = differenceInCalendarDays(food.expiresAt, today);
      return {
        locationId: location.id,
        locationName: location.name,
        foodName: food.name,
        expiresAt: food.expiresAt,
        days,
        riskLabel: getRiskLabel(days),
      } satisfies LocationRouteItem;
    }),
  );

  const routeCandidates = locations.flatMap((location) => {
    const earliestFood = location.foods.reduce<(typeof location.foods)[number] | undefined>(
      (earliest, food) => !earliest || food.expiresAt < earliest.expiresAt ? food : earliest,
      undefined,
    );
    if (!earliestFood) return [];

    const days = differenceInCalendarDays(earliestFood.expiresAt, today);
    return [{
      locationId: location.id,
      locationName: location.name,
      foodName: earliestFood.name,
      expiresAt: earliestFood.expiresAt,
      days,
      riskLabel: getRiskLabel(days),
    } satisfies LocationRouteItem];
  });

  const priorityCount = allItems.filter((item) => item.days <= 7).length;
  const routeItems = routeCandidates
    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime())
    .slice(0, 3);

  return {
    totalFoods: allItems.length,
    priorityCount,
    routeItems,
  };
}
