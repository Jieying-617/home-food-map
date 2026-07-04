import Link from "next/link";
import { JoinFamilyForm } from "@/components/family/JoinFamilyForm";

type PageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function JoinFamilyPage({ searchParams }: PageProps) {
  const { code } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md">
        <Link className="text-sm font-semibold text-emerald-800" href="/f/demo">
          返回试用首页
        </Link>
        <h1 className="mt-5 text-2xl font-bold">加入家庭</h1>
        <p className="mt-1 text-slate-600">输入家里人给你的邀请码，再写一个大家认得出的称呼。</p>
        <div className="mt-5">
          <JoinFamilyForm initialInviteCode={code ?? ""} />
        </div>
      </div>
    </main>
  );
}
