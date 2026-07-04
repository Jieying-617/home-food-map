import { BottomNav } from "@/components/navigation/BottomNav";
import { DatePhotoPanel } from "@/components/add/DatePhotoPanel";
import { ManualEntryPanel } from "@/components/add/ManualEntryPanel";
import { VoiceEntryPanel } from "@/components/add/VoiceEntryPanel";
import { listLocations } from "@/lib/server/locations";

type PageProps = {
  params: Promise<{ familyId: string }>;
  searchParams: Promise<{ locationId?: string }>;
};

export default async function AddFoodPage({ params, searchParams }: PageProps) {
  const { familyId } = await params;
  const { locationId } = await searchParams;
  const locations = await listLocations(familyId);
  const choices = locations.map((location) => ({ id: location.id, name: location.name }));
  const initialLocationId = choices.some((location) => location.id === locationId) ? locationId ?? "" : "";

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">添加食物</h1>
      <p className="mt-1 text-slate-600">识别出来的内容都可以先改，再保存</p>
      <div className="mt-5 space-y-5">
        <VoiceEntryPanel familyId={familyId} locations={choices} initialLocationId={initialLocationId} />
        <DatePhotoPanel familyId={familyId} locations={choices} initialLocationId={initialLocationId} />
        <ManualEntryPanel familyId={familyId} locations={choices} initialLocationId={initialLocationId} />
      </div>
      <BottomNav familyId={familyId} />
    </main>
  );
}
