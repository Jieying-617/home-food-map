import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JoinFamilyForm } from "@/components/family/JoinFamilyForm";

type PageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function JoinFamilyPage({ searchParams }: PageProps) {
  const { code } = await searchParams;

  return (
    <main className="app-fabric min-h-screen px-4 py-6 text-[var(--color-foreground)]">
      <div className="mx-auto max-w-md">
        <Link className="btn-quiet min-h-11 px-3 text-sm" href="/f/demo">
          <ArrowLeft aria-hidden className="h-4 w-4" />
          返回试用首页
        </Link>
        <section className="surface-card mt-4 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]">加入家庭</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">用邀请码进入库存地图</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">输入家里人给你的邀请码，再写一个大家认得出的称呼。</p>
          <div className="mt-5">
            <JoinFamilyForm initialInviteCode={code ?? ""} />
          </div>
        </section>
      </div>
    </main>
  );
}
