import Link from "next/link";
import { ArrowRight, Box, CalendarClock, ImageOff } from "lucide-react";

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
      className="group grid overflow-hidden rounded-lg border border-[var(--color-border)] bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] sm:grid-cols-[180px_1fr]"
    >
      <div className="vichy-check aspect-[4/3] sm:aspect-auto">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={location.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full min-h-36 flex-col items-center justify-center gap-2 text-slate-500">
            <ImageOff aria-hidden className="h-7 w-7" />
            <span className="text-sm font-bold">未拍照</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col justify-between gap-5 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-xl font-black text-slate-950">{location.name}</h3>
            <ArrowRight aria-hidden className="mt-1 h-5 w-5 shrink-0 text-slate-400 group-hover:text-[var(--color-primary)]" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 font-bold text-slate-700">
              <Box aria-hidden className="h-4 w-4" />
              {location.foods.length} 件在库
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-3 py-1 font-bold text-[var(--color-primary-strong)]">
              <CalendarClock aria-hidden className="h-4 w-4" />
              {nextFood ? nextFood.name : "暂无到期项"}
            </span>
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          {nextFood ? `最近到期：${nextFood.expiresAt.toLocaleDateString("zh-CN")}` : "这个位置还没有录入食物。"}
        </p>
      </div>
    </Link>
  );
}
