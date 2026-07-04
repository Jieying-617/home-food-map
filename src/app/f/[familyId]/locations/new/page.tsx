import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { BottomNav } from "@/components/navigation/BottomNav";
import { CreateLocationForm } from "@/components/location/CreateLocationForm";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function NewLocationPage({ params }: PageProps) {
  const { familyId } = await params;

  return (
    <AppShell bottomNav={<BottomNav familyId={familyId} />}>
      <PageHeader
        eyebrow="新增存储点"
        title="给真实位置取个好记的名字"
        description="比如冰箱冷藏层、妈妈零食柜、餐边柜抽屉。之后添加食物时就能直接选中它。"
      />
      <CreateLocationForm familyId={familyId} />
    </AppShell>
  );
}
