import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRight, Box, CalendarClock } from "lucide-react";
import { getExpiryNotice } from "@/lib/domain/expiry";
import {
  getLocationIllustrationSrc,
  getLocationIllustrationType,
} from "@/components/location/LocationIllustration";

type LocationFood = { name: string; expiresAt: Date };

type LocationCardProps = {
  familyId: string;
  today?: Date;
  location: {
    id: string;
    name: string;
    tags?: string | null;
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
  const cover = location.photoUrl;
  const fallbackType = getLocationIllustrationType(location);
  const nextFood = location.foods[0];
  const risk = summarizeLocationRisk(location.foods, today);
  const priorityText = nextFood ? `${risk.hasUrgentItems ? "先处理" : "最早到期"}：${nextFood.name}` : "这个位置还没有录入食物";

  return (
    <Link
      href={`/f/${familyId}/locations/${location.id}`}
      className="forest-location-card group"
    >
      <div className="forest-location-cover">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={location.name} className="object-cover" />
        ) : (
          <Image
            src={getLocationIllustrationSrc(fallbackType)}
            alt={`${location.name} 默认柜子插画`}
            fill
            sizes="(max-width: 420px) 112px, (max-width: 560px) 104px, 152px"
            className="forest-location-object-illustration"
          />
        )}
      </div>
      <div className="forest-location-card-copy">
        <div className="forest-location-card-heading">
          <h3>{location.name}</h3>
          <ArrowRight aria-hidden />
        </div>
        <div className="forest-location-meta">
          <span>
            <Box aria-hidden />
            {location.foods.length} 件在库
          </span>
          <span>
            <CalendarClock aria-hidden />
            {nextFood ? nextFood.name : "暂无到期项"}
          </span>
        </div>
        <div className="forest-location-risks">
            {risk.badges.map((badge) => (
              <span key={badge.label} className={`risk-badge ${badge.className}`}>
                {badge.label}
              </span>
            ))}
        </div>
        <div className="forest-location-summary">
          <p>{priorityText}</p>
          <span>{nextFood ? `最近到期：${nextFood.expiresAt.toLocaleDateString("zh-CN")}` : "下次收纳时可从这个位置录入。"}</span>
        </div>
      </div>
    </Link>
  );
}

