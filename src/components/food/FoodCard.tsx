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
  expired: "risk-badge-expired",
  today: "risk-badge-today",
  soon: "risk-badge-today",
  warning: "risk-badge-week",
  normal: "risk-badge-month",
  later: "risk-badge-calm",
};

function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : String(quantity).replace(/\.0+$/, "");
}

export function FoodCard({ familyId, food, today = new Date() }: FoodCardProps) {
  const expiresAt = format(food.expiresAt, "yyyy-MM-dd");
  const notice = getExpiryNotice(expiresAt, today);

  return (
    <article className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-slate-950">{food.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="meta-pill">
              {formatQuantity(food.quantity)}
              {food.unit}
            </span>
            <span className="meta-pill">
              <MapPin aria-hidden className="h-3.5 w-3.5" />
              {food.location.name}
            </span>
            <span className="meta-pill">
              <CalendarDays aria-hidden className="h-3.5 w-3.5" />
              {expiresAt}
            </span>
          </div>
        </div>
        <span className={`risk-badge shrink-0 ${noticeClass[notice.tone]}`}>
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
            className="btn-quiet min-h-12 w-full gap-1 px-2 text-sm"
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
            className="btn-danger min-h-12 w-full gap-1 px-2 text-sm"
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
