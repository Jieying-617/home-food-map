import Link from "next/link";
import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
import { groupExpiry, type ExpiryGroups } from "@/lib/domain/expiry";
import { listFoods } from "@/lib/server/foods";
import { listLocations } from "@/lib/server/locations";

type PageProps = {
  params: Promise<{ familyId: string }>;
  searchParams: Promise<{ locationId?: string }>;
};

type FoodWithLocation = Awaited<ReturnType<typeof listFoods>>[number];

type GroupSection = {
  key: keyof Omit<ExpiryGroups, "later">;
  title: string;
  description: string;
  className: string;
};

const sections: GroupSection[] = [
  {
    key: "expired",
    title: "已过期",
    description: "需要先处理，避免继续放着忘记。",
    className: "border-red-200 bg-red-50",
  },
  {
    key: "today",
    title: "今天到期",
    description: "今天优先吃掉或处理。",
    className: "border-red-200 bg-red-50",
  },
  {
    key: "within3Days",
    title: "3 天内",
    description: "这几天安排一下。",
    className: "border-orange-200 bg-orange-50",
  },
  {
    key: "within7Days",
    title: "7 天内",
    description: "本周需要留意。",
    className: "border-yellow-200 bg-yellow-50",
  },
  {
    key: "within30Days",
    title: "30 天内",
    description: "常温囤货别拖太久。",
    className: "border-emerald-100 bg-emerald-50",
  },
];

function filterClass(isActive: boolean) {
  return [
    "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
    isActive ? "bg-emerald-700 text-white" : "bg-white text-slate-700",
  ].join(" ");
}

function mapFoodsByGroup(foods: FoodWithLocation[], groups: ExpiryGroups) {
  const byId = new Map(foods.map((food) => [food.id, food]));
  return sections.map((section) => ({
    ...section,
    foods: groups[section.key].map((item) => byId.get(item.id)).filter((food): food is FoodWithLocation => Boolean(food)),
  }));
}

export default async function FamilyDashboard({ params, searchParams }: PageProps) {
  const { familyId } = await params;
  const { locationId } = await searchParams;
  const [foods, locations] = await Promise.all([
    listFoods(familyId, { locationId }),
    listLocations(familyId),
  ]);
  const today = new Date();
  const groups = groupExpiry(
    foods.map((food) => ({
      id: food.id,
      name: food.name,
      expiresAt: food.expiresAt.toISOString().slice(0, 10),
      status: food.status as "active",
      locationId: food.locationId,
      quantity: food.quantity,
      unit: food.unit,
    })),
    today,
  );
  const groupedSections = mapFoodsByGroup(foods, groups);
  const urgentCount = groupedSections.reduce((count, section) => count + section.foods.length, 0);

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">快到期</h1>
      <p className="mt-1 text-slate-600">先处理最容易忘的东西</p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <Link className={filterClass(!locationId)} href={`/f/${familyId}`}>
          全部
        </Link>
        {locations.map((location) => (
          <Link
            key={location.id}
            className={filterClass(locationId === location.id)}
            href={`/f/${familyId}?locationId=${location.id}`}
          >
            {location.name}
          </Link>
        ))}
      </div>
      <section className="mt-5 space-y-4">
        {groupedSections.map((section) =>
          section.foods.length ? (
            <section key={section.key} className={`rounded-lg border p-3 ${section.className}`}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">{section.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{section.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-700">
                  {section.foods.length} 件
                </span>
              </div>
              <div className="space-y-3">
                {section.foods.map((food) => (
                  <FoodCard key={food.id} familyId={familyId} food={food} today={today} />
                ))}
              </div>
            </section>
          ) : null,
        )}
        {urgentCount === 0 ? (
          <p className="rounded-lg bg-white p-4 text-slate-600">当前筛选下没有 30 天内到期的食物。</p>
        ) : null}
      </section>
      <BottomNav familyId={familyId} />
    </main>
  );
}
