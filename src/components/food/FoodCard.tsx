import { format } from "date-fns";
import { PackageCheck, Trash2, Utensils } from "lucide-react";
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
  expired: "bg-red-100 text-red-800",
  today: "bg-red-100 text-red-800",
  soon: "bg-orange-100 text-orange-800",
  warning: "bg-yellow-100 text-yellow-800",
  normal: "bg-emerald-50 text-emerald-800",
  later: "bg-slate-100 text-slate-700",
};

function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : String(quantity).replace(/\.0+$/, "");
}

function formatTakeLabel(unit: string) {
  return `消耗1${unit}`;
}

export function FoodCard({ familyId, food, today = new Date() }: FoodCardProps) {
  const expiresAt = format(food.expiresAt, "yyyy-MM-dd");
  const notice = getExpiryNotice(expiresAt, today);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-slate-950">{food.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {formatQuantity(food.quantity)}{food.unit} · {food.location.name}
          </p>
          <p className="mt-1 text-sm text-slate-600">到期：{expiresAt}</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${noticeClass[notice.tone]}`}>
          {notice.label}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <form
          action={async () => {
            "use server";
            await performFoodAction({ familyId, foodId: food.id, type: "take", quantity: 1 });
          }}
        >
          <button className="flex min-h-12 w-full items-center justify-center gap-1 rounded-md bg-emerald-50 px-1 text-sm font-semibold text-emerald-800">
            <PackageCheck aria-hidden className="h-4 w-4 shrink-0" />
            <span>{formatTakeLabel(food.unit)}</span>
          </button>
        </form>
        <form
          action={async () => {
            "use server";
            await performFoodAction({ familyId, foodId: food.id, type: "finish" });
          }}
        >
          <button className="flex min-h-12 w-full items-center justify-center gap-1 rounded-md bg-blue-50 px-1 text-sm font-semibold text-blue-800">
            <Utensils aria-hidden className="h-4 w-4 shrink-0" />
            <span>全部消耗</span>
          </button>
        </form>
        <form
          action={async () => {
            "use server";
            await performFoodAction({ familyId, foodId: food.id, type: "discard" });
          }}
        >
          <button className="flex min-h-12 w-full items-center justify-center gap-1 rounded-md bg-rose-50 px-1 text-sm font-semibold text-rose-800">
            <Trash2 aria-hidden className="h-4 w-4 shrink-0" />
            <span>全部丢弃</span>
          </button>
        </form>
      </div>
    </article>
  );
}
