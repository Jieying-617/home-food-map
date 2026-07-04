import { BottomNav } from "@/components/navigation/BottomNav";
import { listOperations } from "@/lib/server/operations";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

const labels: Record<string, string> = {
  create: "新增",
  take: "消耗1件",
  finish: "全部消耗",
  discard: "全部丢弃",
};

export default async function RecordsPage({ params }: PageProps) {
  const { familyId } = await params;
  const operations = await listOperations(familyId);

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">操作记录</h1>
      <section className="mt-5 space-y-3">
        {operations.map((operation) => (
          <article key={operation.id} className="rounded-lg bg-white p-4">
            <p className="font-semibold">{labels[operation.type] ?? operation.type}</p>
            <p className="mt-1 text-sm text-slate-600">
              {operation.food?.name ?? "食物记录"} · {operation.createdAt.toLocaleString("zh-CN")}
            </p>
          </article>
        ))}
        {operations.length === 0 ? <p className="rounded-lg bg-white p-4 text-slate-600">还没有操作记录。</p> : null}
      </section>
      <BottomNav familyId={familyId} />
    </main>
  );
}
