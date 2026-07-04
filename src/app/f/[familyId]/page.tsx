import Link from "next/link";
import { AlertTriangle, CalendarDays, Clock3, Plus, ShieldCheck } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
import { CurrentMemberNotice } from "@/components/family/CurrentMemberNotice";
import { groupExpiry, summarizeExpiry, type ExpiryGroups } from "@/lib/domain/expiry";
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
    title: "已经过期",
    description: "优先确认是否还能使用，不能再留在库存里。",
    className: "border-red-200 bg-red-50",
  },
  {
    key: "today",
    title: "今天到期",
    description: "今天先吃掉、冷冻或处理。",
    className: "border-red-200 bg-red-50",
  },
  {
    key: "within3Days",
    title: "3 天内",
    description: "适合安排进这几天的菜单。",
    className: "border-orange-200 bg-orange-50",
  },
  {
    key: "within7Days",
    title: "7 天内",
    description: "本周采购前先看这里。",
    className: "border-amber-200 bg-amber-50",
  },
  {
    key: "within30Days",
    title: "30 天内",
    description: "常温和囤货需要定期巡检。",
    className: "border-teal-200 bg-teal-50",
  },
];

function filterClass(isActive: boolean) {
  return [
    "shrink-0 rounded-full border px-4 py-2 text-sm font-bold",
    isActive
      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
      : "border-[var(--color-border)] bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50",
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
  const summary = summarizeExpiry(groups);
  const groupedSections = mapFoodsByGroup(foods, groups);
  const urgentCount = groupedSections.reduce((count, section) => count + section.foods.length, 0);
  const activeLocation = locations.find((location) => location.id === locationId);

  const summaryCards = [
    { label: "已过期", value: summary.expiredCount, icon: AlertTriangle, className: "bg-red-50 text-red-800" },
    { label: "今天到期", value: summary.todayCount, icon: Clock3, className: "bg-rose-50 text-rose-800" },
    { label: "7 天内", value: summary.within7DaysCount, icon: CalendarDays, className: "bg-amber-50 text-amber-800" },
    { label: "30 天内", value: summary.within30DaysCount, icon: ShieldCheck, className: "bg-teal-50 text-teal-800" },
  ];

  return (
    <AppShell bottomNav={<BottomNav familyId={familyId} />}>
      <PageHeader
        eyebrow={activeLocation ? "位置提醒" : "全家提醒"}
        title="今天先处理什么"
        description="按到期风险自动整理库存，先看红色和橙色，再决定今天吃什么、丢什么、补什么。"
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 text-sm font-bold text-white hover:bg-orange-600"
            href={`/f/${familyId}/add${locationId ? `?locationId=${locationId}` : ""}`}
          >
            <Plus aria-hidden className="h-4 w-4" />
            添加食物
          </Link>
        }
      />
      <CurrentMemberNotice familyId={familyId} />

      <section className="rounded-lg border border-[var(--color-border)] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500">{activeLocation ? activeLocation.name : "全部位置"}</p>
            <p className="mt-2 text-xl font-black text-slate-950">{summary.headline}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              当前筛选下共有 {summary.totalReminderCount} 件 30 天内到期，其中 {summary.urgentCount} 件需要优先处理。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[420px]">
            {summaryCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className={`rounded-lg p-3 ${card.className}`}>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Icon aria-hidden className="h-4 w-4 shrink-0" />
                    <span>{card.label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-black">{card.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
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

      <section className="space-y-4">
        {groupedSections.map((section) =>
          section.foods.length ? (
            <section key={section.key} className={`rounded-lg border p-3 sm:p-4 ${section.className}`}>
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{section.description}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-black text-slate-700">
                  {section.foods.length} 件
                </span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {section.foods.map((food) => (
                  <FoodCard key={food.id} familyId={familyId} food={food} today={today} />
                ))}
              </div>
            </section>
          ) : null,
        )}
        {urgentCount === 0 ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 text-center">
            <p className="text-lg font-black text-slate-950">当前没有 30 天内到期的食物</p>
            <p className="mt-2 text-sm text-slate-600">可以去位置地图看看库存分布，或继续添加新的食材。</p>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
