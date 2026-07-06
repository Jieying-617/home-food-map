import { format } from "date-fns";
import { CalendarDays, MapPin, Trash2, Utensils } from "lucide-react";
import { ConsumeFoodButton } from "@/components/food/ConsumeFoodButton";
import { getExpiryNotice } from "@/lib/domain/expiry";
import { performFoodAction } from "@/lib/server/foods";

type FoodCardProps = {
  familyId: string;
  today?: Date;
  food: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiresAt: Date;
    location: { name: string };
  };
};

const noticeClass = {
  expired: "border-[color-mix(in_srgb,var(--color-destructive)_30%,white)] bg-[color-mix(in_srgb,var(--color-destructive)_10%,white)] text-[var(--color-destructive)]",
  today: "border-[color-mix(in_srgb,var(--color-destructive)_30%,white)] bg-[color-mix(in_srgb,var(--color-destructive)_10%,white)] text-[var(--color-destructive)]",
  soon: "border-[color-mix(in_srgb,var(--color-accent)_30%,white)] bg-[var(--color-accent-soft)] text-[color-mix(in_srgb,var(--color-accent)_72%,black)]",
  warning: "border-[color-mix(in_srgb,var(--color-accent)_24%,white)] bg-[var(--color-accent-soft)] text-[color-mix(in_srgb,var(--color-accent)_68%,black)]",
  normal: "border-[color-mix(in_srgb,var(--color-primary)_24%,white)] bg-[var(--color-primary-soft)] text-[var(--color-primary-strong)]",
  later: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : String(quantity).replace(/\.0+$/, "");
}

export function FoodCard({ familyId, food, today = new Date() }: FoodCardProps) {
  const expiresAt = format(food.expiresAt, "yyyy-MM-dd");
  const notice = getExpiryNotice(expiresAt, today);

  return (
    <article className="rounded-lg border border-[var(--color-border)] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-slate-950">{food.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 font-semibold text-slate-700">
              {formatQuantity(food.quantity)}
              {food.unit}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
              <MapPin aria-hidden className="h-3.5 w-3.5" />
              {food.location.name}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1">
              <CalendarDays aria-hidden className="h-3.5 w-3.5" />
              {expiresAt}
            </span>
          </div>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${noticeClass[notice.tone]}`}>
          {notice.label}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <ConsumeFoodButton familyId={familyId} foodId={food.id} unit={food.unit} />
        <form
          action={async () => {
            "use server";
            await performFoodAction({ familyId, foodId: food.id, type: "finish" });
          }}
        >
          <button
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-[var(--color-primary-soft)] px-2 text-sm font-bold text-[var(--color-primary-strong)] hover:bg-[var(--color-muted)]"
            type="submit"
          >
            <Utensils aria-hidden className="h-4 w-4 shrink-0" />
            <span className="truncate">全部吃完</span>
          </button>
        </form>
        <form
          action={async () => {
            "use server";
            await performFoodAction({ familyId, foodId: food.id, type: "discard" });
          }}
        >
          <button
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-[color-mix(in_srgb,var(--color-destructive)_10%,white)] px-2 text-sm font-bold text-[var(--color-destructive)] hover:bg-[color-mix(in_srgb,var(--color-destructive)_16%,white)]"
            type="submit"
          >
            <Trash2 aria-hidden className="h-4 w-4 shrink-0" />
            <span className="truncate">丢弃</span>
          </button>
        </form>
      </div>
    </article>
  );
}
