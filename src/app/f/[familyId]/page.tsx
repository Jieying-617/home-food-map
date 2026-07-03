import { BottomNav } from "@/components/navigation/BottomNav";
import { FoodCard } from "@/components/food/FoodCard";
import { groupExpiry } from "@/lib/domain/expiry";
import { listFoods } from "@/lib/server/foods";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function FamilyDashboard({ params }: PageProps) {
  const { familyId } = await params;
  const foods = await listFoods(familyId);
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
    new Date(),
  );
  const urgentIds = new Set(
    [...groups.expired, ...groups.today, ...groups.within3Days, ...groups.within7Days, ...groups.within30Days].map(
      (food) => food.id,
    ),
  );
  const urgentFoods = foods.filter((food) => urgentIds.has(food.id));

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">快到期</h1>
      <p className="mt-1 text-slate-600">先处理最容易忘的东西</p>
      <section className="mt-5 space-y-3">
        {urgentFoods.map((food) => (
          <FoodCard key={food.id} familyId={familyId} food={food} />
        ))}
        {urgentFoods.length === 0 ? (
          <p className="rounded-lg bg-white p-4 text-slate-600">目前没有 30 天内到期的食物。</p>
        ) : null}
      </section>
      <BottomNav familyId={familyId} />
    </main>
  );
}
