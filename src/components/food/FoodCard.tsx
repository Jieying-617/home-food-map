import { format } from "date-fns";
import { PackageCheck, Trash2, Utensils } from "lucide-react";
import { performFoodAction } from "@/lib/server/foods";

type FoodCardProps = {
  familyId: string;
  food: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    expiresAt: Date;
    location: { name: string };
  };
};

function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : String(quantity).replace(/\.0+$/, "");
}

export function FoodCard({ familyId, food }: FoodCardProps) {
  const expiresAt = format(food.expiresAt, "yyyy-MM-dd");

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
            <span>我拿了</span>
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
            <span>吃完了</span>
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
            <span>丢弃</span>
          </button>
        </form>
      </div>
    </article>
  );
}
