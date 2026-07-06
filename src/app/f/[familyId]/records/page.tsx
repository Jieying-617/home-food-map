import { History } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { BottomNav } from "@/components/navigation/BottomNav";
import { listOperations } from "@/lib/server/operations";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

type OperationSnapshot = {
  name?: string;
  quantity?: number;
  unit?: string;
  status?: string;
};

const labels: Record<string, string> = {
  create: "新增",
  take: "消耗 1 件",
  finish: "全部吃完",
  discard: "全部丢弃",
};

function parseSnapshot(value: string | null): OperationSnapshot | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as OperationSnapshot;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function formatQuantity(quantity: unknown, unit: unknown) {
  if (typeof quantity !== "number") return null;
  const normalizedQuantity = Number.isInteger(quantity) ? String(quantity) : String(quantity).replace(/\.0+$/, "");
  return `${normalizedQuantity}${typeof unit === "string" && unit ? unit : "件"}`;
}

function operationDetail(type: string, beforeValue: string | null, afterValue: string | null) {
  const before = parseSnapshot(beforeValue);
  const after = parseSnapshot(afterValue);
  const beforeQuantity = formatQuantity(before?.quantity, before?.unit ?? after?.unit);
  const afterQuantity = formatQuantity(after?.quantity, after?.unit ?? before?.unit);

  if (type === "create" && afterQuantity) return `新增 ${afterQuantity}，到期前记得处理`;
  if (type === "take" && beforeQuantity && afterQuantity) return `数量 ${beforeQuantity} -> ${afterQuantity}`;
  if (type === "finish") return beforeQuantity ? `从 ${beforeQuantity} 标记为已吃完` : "已标记为全部吃完";
  if (type === "discard") return beforeQuantity ? `从 ${beforeQuantity} 标记为已丢弃` : "已标记为全部丢弃";
  return afterQuantity ? `当前数量 ${afterQuantity}` : "库存已更新";
}

export default async function RecordsPage({ params }: PageProps) {
  const { familyId } = await params;
  const operations = await listOperations(familyId);

  return (
    <AppShell bottomNav={<BottomNav familyId={familyId} />}>
      <PageHeader
        eyebrow="家庭流水"
        title="操作记录"
        description="所有新增、消耗、吃完和丢弃都会留在这里，方便家里人同步库存变化。"
      />
      <section className="space-y-3">
        {operations.map((operation) => {
          const detail = operationDetail(operation.type, operation.before, operation.after);
          return (
            <article key={operation.id} className="surface-card flex gap-3 p-4">
              <div className="icon-tile">
                <History aria-hidden className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-slate-950">{labels[operation.type] ?? operation.type}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {operation.food?.name ?? "食物记录"} · {operation.createdAt.toLocaleString("zh-CN")}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{detail}</p>
                <p className="mt-1 text-sm text-slate-500">操作人：{operation.actor?.nickname ?? "未记录"}</p>
              </div>
            </article>
          );
        })}
        {operations.length === 0 ? (
          <div className="empty-state">
            <p className="text-lg font-black text-slate-950">还没有操作记录</p>
            <p className="mt-2 text-sm text-slate-600">添加或处理食物后，这里会出现家庭库存流水。</p>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
