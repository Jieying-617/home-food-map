import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { BottomNav } from "@/components/navigation/BottomNav";
import { DatePhotoPanel } from "@/components/add/DatePhotoPanel";
import { ManualEntryPanel } from "@/components/add/ManualEntryPanel";
import { VoiceEntryPanel } from "@/components/add/VoiceEntryPanel";
import { CurrentMemberNotice } from "@/components/family/CurrentMemberNotice";
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
    <AppShell bottomNav={<BottomNav familyId={familyId} />}>
      <PageHeader
        eyebrow="新增库存"
        title="把食物放进地图"
        description="先选择最快的录入方式，识别结果都可以在保存前修改。位置越准确，之后找东西和处理到期越省心。"
      />
      <CurrentMemberNotice familyId={familyId} />
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <VoiceEntryPanel familyId={familyId} locations={choices} initialLocationId={initialLocationId} />
        <DatePhotoPanel familyId={familyId} locations={choices} initialLocationId={initialLocationId} />
        <div className="lg:col-span-2">
          <ManualEntryPanel familyId={familyId} locations={choices} initialLocationId={initialLocationId} />
        </div>
      </div>
    </AppShell>
  );
}
