import Link from "next/link";

type LocationCardProps = {
  familyId: string;
  location: {
    id: string;
    name: string;
    sketchCoverUrl: string | null;
    photoUrl: string | null;
    foods: Array<{ name: string; expiresAt: Date }>;
  };
};

export function LocationCard({ familyId, location }: LocationCardProps) {
  const cover = location.sketchCoverUrl || location.photoUrl;
  const nextFood = location.foods[0];

  return (
    <Link
      href={`/f/${familyId}/locations/${location.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="aspect-[4/3] overflow-hidden rounded-md bg-slate-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={location.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-500">未拍照</div>
        )}
      </div>
      <h3 className="mt-3 text-lg font-bold text-slate-950">{location.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{location.foods.length} 件在库</p>
      <p className="mt-1 text-sm text-slate-600">最近到期：{nextFood ? nextFood.name : "暂无"}</p>
    </Link>
  );
}
