import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
import { LocationCoverManager } from "@/components/location/LocationCoverManager";
import { listFoods } from "@/lib/server/foods";
import { listLocations } from "@/lib/server/locations";

type PageProps = {
  params: Promise<{ familyId: string; locationId: string }>;
};

export default async function LocationDetailPage({ params }: PageProps) {
  const { familyId, locationId } = await params;
  const [locations, foods] = await Promise.all([
    listLocations(familyId),
    listFoods(familyId, { locationId }),
  ]);
  const location = locations.find((item) => item.id === locationId);
  if (!location) notFound();

  return (
    <AppShell bottomNav={<BottomNav familyId={familyId} />}>
      <PageHeader
        eyebrow="位置详情"
        title={location.name}
        description={`这里有 ${foods.length} 件在库食物，默认按到期时间排序。处理完的东西会进入操作记录。`}
        action={
          <Link
            href={`/f/${familyId}/add?locationId=${locationId}`}
            className="btn-accent text-sm"
          >
            <Plus aria-hidden className="h-4 w-4" />
            添加到这里
          </Link>
        }
      />
      <LocationCoverManager familyId={familyId} location={location} />
      <section className="grid gap-3 lg:grid-cols-2">
        {foods.map((food) => (
          <FoodCard key={food.id} familyId={familyId} food={food} />
        ))}
        {foods.length === 0 ? (
          <div className="empty-state lg:col-span-2">
            <p className="text-lg font-black text-slate-950">这个位置暂时没有在库食物</p>
            <p className="mt-2 text-sm text-slate-600">下次收纳时可以直接添加到这里。</p>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
