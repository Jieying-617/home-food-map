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
  expired: "border-red-200 bg-red-50 text-red-800",
  today: "border-red-200 bg-red-50 text-red-800",
  soon: "border-orange-200 bg-orange-50 text-orange-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  normal: "border-teal-200 bg-teal-50 text-teal-800",
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
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-sky-50 px-2 text-sm font-bold text-sky-800 hover:bg-sky-100"
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
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-rose-50 px-2 text-sm font-bold text-rose-800 hover:bg-rose-100"
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
