import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { BottomNav } from "@/components/navigation/BottomNav";
import { LocationCard } from "@/components/location/LocationCard";
import { listLocations } from "@/lib/server/locations";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function LocationsPage({ params }: PageProps) {
  const { familyId } = await params;
  const locations = await listLocations(familyId);
  const totalFoods = locations.reduce((sum, location) => sum + location.foods.length, 0);

  return (
    <AppShell bottomNav={<BottomNav familyId={familyId} />}>
      <PageHeader
        eyebrow="家中存储地图"
        title="按位置管理库存"
        description={`当前有 ${locations.length} 个位置、${totalFoods} 件食物。先选冰箱、柜子或抽屉，再处理里面的库存。`}
        action={
          <Link
            href={`/f/${familyId}/locations/new`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 text-sm font-bold text-white hover:opacity-90"
          >
            <Plus aria-hidden className="h-4 w-4" />
            添加位置
          </Link>
        }
      />
      <section className="grid gap-3">
        {locations.map((location) => (
          <LocationCard key={location.id} familyId={familyId} location={location} />
        ))}
        {locations.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-6 text-center">
            <p className="text-lg font-black text-slate-950">先创建第一个存储位置</p>
            <p className="mt-2 text-sm text-slate-600">比如冰箱冷藏层、厨房吊柜、零食抽屉。</p>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
