import Link from "next/link";
import { UserCheck } from "lucide-react";
import { getCurrentMember } from "@/lib/server/currentMember";

export async function CurrentMemberNotice({ familyId }: { familyId: string }) {
  const currentMember = await getCurrentMember(familyId);

  return (
    <section className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="icon-tile">
          <UserCheck aria-hidden className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-500">当前使用者</p>
          <p className="mt-1 font-black text-slate-950">{currentMember?.nickname ?? "还没有选择"}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">新增、消耗、吃完和丢弃都会记到这个人名下。</p>
        </div>
      </div>
      <Link
        className="btn-dark min-h-11 text-sm"
        href={`/f/${familyId}/family`}
      >
        {currentMember ? "切换使用者" : "去选择使用者"}
      </Link>
    </section>
  );
}
