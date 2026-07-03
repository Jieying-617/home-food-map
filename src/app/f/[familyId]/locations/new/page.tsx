import { BottomNav } from "@/components/navigation/BottomNav";
import { CreateLocationForm } from "@/components/location/CreateLocationForm";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function NewLocationPage({ params }: PageProps) {
  const { familyId } = await params;

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">添加位置</h1>
      <p className="mt-1 text-slate-600">给真实的柜子、箱子或抽屉取一个家里人认得的名字</p>
      <div className="mt-5">
        <CreateLocationForm familyId={familyId} />
      </div>
      <BottomNav familyId={familyId} />
    </main>
  );
}
