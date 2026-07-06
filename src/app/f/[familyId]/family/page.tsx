import Link from "next/link";
import { Link2, Palette, ShieldCheck, UserCheck, UserRound } from "lucide-react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { AppearanceTuningPanel } from "@/components/layout/AppearanceTuningPanel";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { BottomNav } from "@/components/navigation/BottomNav";
import { DEMO_FAMILY_INVITE_CODE } from "@/lib/domain/familyInvite";
import { getCurrentMemberId } from "@/lib/server/currentMember";
import { getDemoFamily, selectCurrentFamilyMember } from "@/lib/server/families";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function FamilyPage({ params }: PageProps) {
  const { familyId } = await params;
  const [family, currentMemberId] = await Promise.all([getDemoFamily(), getCurrentMemberId(familyId)]);
  const inviteHref = `/join?code=${DEMO_FAMILY_INVITE_CODE}`;
  const currentMember = family.members.find((member) => member.id === currentMemberId);

  return (
    <AppShell bottomNav={<BottomNav familyId={familyId} />}>
      <PageHeader
        eyebrow="设置"
        title={family.name}
        description="管理家庭成员、当前使用者和页面外观。日常提醒和库存页面会保持干净，不再显示配色试衣间。"
      />

      <section className="surface-card p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="icon-tile">
            <UserCheck aria-hidden className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">当前使用者</p>
            <p className="mt-1 text-xl font-black text-slate-950">{currentMember?.nickname ?? "还没有选择"}</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">新增、消耗和丢弃记录会记到当前使用者名下。</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Palette aria-hidden className="h-5 w-5 text-[var(--color-primary)]" />
          <h2 className="text-lg font-black text-slate-950">外观设置</h2>
        </div>
        <ThemeSwitcher />
        <AppearanceTuningPanel />
      </section>

      <section className="surface-card-muted p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="icon-tile bg-[var(--color-surface)]">
            <Link2 aria-hidden className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[var(--color-primary-strong)]">邀请家人加入</p>
            <div className="surface-card mt-3 p-4 shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">试用邀请码</p>
              <p className="mt-1 break-all text-2xl font-black tracking-widest text-slate-950">{DEMO_FAMILY_INVITE_CODE}</p>
            </div>
            <Link
              className="btn-primary mt-3 w-full sm:w-auto"
              href={inviteHref}
            >
              打开邀请链接
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="px-1 text-lg font-black text-slate-950">成员管理</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {family.members.map((member) => (
            <article key={member.id} className="surface-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="icon-tile bg-[var(--color-muted)] text-slate-700">
                    {member.role === "admin" ? <ShieldCheck aria-hidden className="h-5 w-5" /> : <UserRound aria-hidden className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950">{member.nickname}</p>
                    <p className="mt-1 text-sm text-slate-600">{member.role === "admin" ? "管理员" : "成员"}</p>
                  </div>
                </div>
                {member.id === currentMemberId ? (
                  <span className="shrink-0 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 text-sm font-bold text-[var(--color-primary-strong)]">
                    使用中
                  </span>
                ) : null}
              </div>
              {member.id !== currentMemberId ? (
                <form
                  className="mt-3"
                  action={async () => {
                    "use server";
                    await selectCurrentFamilyMember({ familyId, memberId: member.id });
                  }}
                >
                  <button className="btn-dark min-h-11 w-full px-3 text-sm">
                    切换成这个人
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
