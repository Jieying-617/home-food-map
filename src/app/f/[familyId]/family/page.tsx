import Link from "next/link";
import { BottomNav } from "@/components/navigation/BottomNav";
import { DEMO_FAMILY_INVITE_CODE } from "@/lib/domain/familyInvite";
import { getDemoFamily } from "@/lib/server/families";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function FamilyPage({ params }: PageProps) {
  const { familyId } = await params;
  const family = await getDemoFamily();
  const inviteHref = `/join?code=${DEMO_FAMILY_INVITE_CODE}`;

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">{family.name}</h1>
      <p className="mt-1 text-slate-600">家里人一起维护，谁拿了就顺手标记一下</p>

      <section className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-900">邀请家人加入</p>
        <div className="mt-3 rounded-md bg-white p-3">
          <p className="text-xs font-semibold text-slate-500">试用邀请码</p>
          <p className="mt-1 text-2xl font-black tracking-widest text-slate-950">{DEMO_FAMILY_INVITE_CODE}</p>
        </div>
        <Link className="mt-3 block min-h-12 rounded-md bg-emerald-700 px-4 py-3 text-center font-bold text-white" href={inviteHref}>
          打开邀请链接
        </Link>
      </section>

      <section className="mt-5 space-y-3">
        {family.members.map((member) => (
          <article key={member.id} className="rounded-lg bg-white p-4">
            <p className="font-semibold">{member.nickname}</p>
            <p className="mt-1 text-sm text-slate-600">{member.role === "admin" ? "管理员" : "成员"}</p>
          </article>
        ))}
      </section>
      <BottomNav familyId={familyId} />
    </main>
  );
}
