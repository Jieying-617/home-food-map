import Link from "next/link";
import { BottomNav } from "@/components/navigation/BottomNav";
import { LocationCard } from "@/components/location/LocationCard";
import { listLocations } from "@/lib/server/locations";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function LocationsPage({ params }: PageProps) {
  const { familyId } = await params;
  const locations = await listLocations(familyId);

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">位置地图</h1>
          <p className="mt-1 text-slate-600">按柜子、箱子和抽屉看库存</p>
        </div>
        <Link href={`/f/${familyId}/locations/new`} className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-bold text-white">
          添加
        </Link>
      </div>
      <section className="mt-5 grid gap-3">
        {locations.map((location) => (
          <LocationCard key={location.id} familyId={familyId} location={location} />
        ))}
      </section>
      <BottomNav familyId={familyId} />
    </main>
  );
}
