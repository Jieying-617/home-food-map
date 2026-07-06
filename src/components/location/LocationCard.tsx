import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Box, CalendarClock, ImageOff } from "lucide-react";
import { getExpiryNotice } from "@/lib/domain/expiry";

type LocationFood = { name: string; expiresAt: Date };

type LocationCardProps = {
  familyId: string;
  today?: Date;
  location: {
    id: string;
    name: string;
    sketchCoverUrl: string | null;
    photoUrl: string | null;
    foods: LocationFood[];
  };
};

type RiskBadge = {
  label: string;
  className: string;
};

const riskBadgeClass = {
  expired: "risk-badge-expired",
  today: "risk-badge-today",
  within7: "risk-badge-week",
  within30: "risk-badge-month",
  calm: "risk-badge-calm",
};

function toDateString(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function summarizeLocationRisk(foods: LocationFood[], today: Date) {
  let expiredCount = 0;
  let todayCount = 0;
  let within7Count = 0;
  let within30Count = 0;

  for (const food of foods) {
    const notice = getExpiryNotice(toDateString(food.expiresAt), today);
    if (notice.days < 0) expiredCount += 1;
    else if (notice.days === 0) todayCount += 1;
    else if (notice.days <= 7) within7Count += 1;
    else if (notice.days <= 30) within30Count += 1;
  }

  const badges: RiskBadge[] = [];
  if (expiredCount > 0) badges.push({ label: `已过期 ${expiredCount} 件`, className: riskBadgeClass.expired });
  if (todayCount > 0) badges.push({ label: `今天到期 ${todayCount} 件`, className: riskBadgeClass.today });
  if (within7Count > 0) badges.push({ label: `7 天内 ${within7Count} 件`, className: riskBadgeClass.within7 });
  if (within30Count > 0) badges.push({ label: `30 天内 ${within30Count} 件`, className: riskBadgeClass.within30 });
  if (badges.length === 0) badges.push({ label: "暂无急事", className: riskBadgeClass.calm });

  return {
    badges,
    hasUrgentItems: expiredCount + todayCount + within7Count > 0,
  };
}

export function LocationCard({ familyId, location, today = new Date() }: LocationCardProps) {
  const cover = location.sketchCoverUrl || location.photoUrl;
  const nextFood = location.foods[0];
  const risk = summarizeLocationRisk(location.foods, today);
  const priorityText = nextFood ? `${risk.hasUrgentItems ? "先处理" : "最早到期"}：${nextFood.name}` : "这个位置还没有录入食物";

  return (
    <Link
      href={`/f/${familyId}/locations/${location.id}`}
      className="surface-card group grid overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)] sm:grid-cols-[180px_1fr]"
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
      <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-xl font-black text-slate-950">{location.name}</h3>
            <ArrowRight aria-hidden className="mt-1 h-5 w-5 shrink-0 text-slate-400 group-hover:text-[var(--color-primary)]" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="meta-pill">
              <Box aria-hidden className="h-4 w-4" />
              {location.foods.length} 件在库
            </span>
            <span className="meta-pill bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]">
              <CalendarClock aria-hidden className="h-4 w-4" />
              {nextFood ? nextFood.name : "暂无到期项"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {risk.badges.map((badge) => (
              <span key={badge.label} className={`risk-badge ${badge.className}`}>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-1 text-sm leading-6 text-slate-600">
          <p className="font-bold text-slate-700">{priorityText}</p>
          <p>{nextFood ? `最近到期：${nextFood.expiresAt.toLocaleDateString("zh-CN")}` : "下次收纳时可从这个位置录入。"}</p>
        </div>
      </div>
    </Link>
  );
}

