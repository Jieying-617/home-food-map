import Link from "next/link";
import { notFound } from "next/navigation";
import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
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
    <main className="min-h-screen px-4 pb-24 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{location.name}</h1>
          <p className="mt-1 text-slate-600">默认按到期时间排序</p>
        </div>
        <Link
          href={`/f/${familyId}/add?locationId=${locationId}`}
          className="shrink-0 rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white"
        >
          添加到这里
        </Link>
      </div>
      <section className="mt-5 space-y-3">
        {foods.map((food) => (
          <FoodCard key={food.id} familyId={familyId} food={food} />
        ))}
        {foods.length === 0 ? (
          <p className="rounded-lg bg-white p-4 text-slate-600">这个位置暂时没有在库食物。</p>
        ) : null}
      </section>
      <BottomNav familyId={familyId} />
    </main>
  );
}
