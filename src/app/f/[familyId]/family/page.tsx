import { BottomNav } from "@/components/navigation/BottomNav";
import { getDemoFamily } from "@/lib/server/families";

type PageProps = {
  params: Promise<{ familyId: string }>;
};

export default async function FamilyPage({ params }: PageProps) {
  const { familyId } = await params;
  const family = await getDemoFamily();

  return (
    <main className="min-h-screen px-4 pb-24 pt-5">
      <h1 className="text-2xl font-bold">{family.name}</h1>
      <p className="mt-1 text-slate-600">家里人一起维护，谁拿了就顺手标记一下</p>
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
