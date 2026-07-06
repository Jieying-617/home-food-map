"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, PackageCheck } from "lucide-react";
import { performFoodAction } from "@/lib/server/foods";

type ConsumeFoodButtonProps = {
  familyId: string;
  foodId: string;
  unit: string;
};

function formatQuantity(quantity: number) {
  return Number.isInteger(quantity) ? String(quantity) : String(quantity).replace(/\.0+$/, "");
}

export function ConsumeFoodButton({ familyId, foodId, unit }: ConsumeFoodButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customQuantity, setCustomQuantity] = useState("0.5");
  const [isPending, startTransition] = useTransition();

  function consume(quantity: number) {
    startTransition(() => {
      void performFoodAction({ familyId, foodId, type: "take", quantity }).then(() => {
        setIsOpen(false);
      });
    });
  }

  const parsedCustomQuantity = Number(customQuantity);
  const canUseCustomQuantity = Number.isFinite(parsedCustomQuantity) && parsedCustomQuantity > 0;

  return (
    <div className="relative">
      <button
        className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-1 rounded-md bg-[var(--color-primary-soft)] px-2 pr-8 text-sm font-bold text-[var(--color-primary-strong)] hover:bg-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        disabled={isPending}
        onClick={() => consume(1)}
      >
        <PackageCheck aria-hidden className="h-4 w-4 shrink-0" />
        <span className="truncate">消耗 1{unit}</span>
      </button>
      <button
        aria-expanded={isOpen}
        aria-label="更多消耗数量"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-[var(--color-primary-strong)] shadow-sm hover:bg-white"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((value) => !value);
        }}
      >
        <MoreHorizontal aria-hidden className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-14 z-20 rounded-lg border border-[var(--color-border)] bg-white p-2 shadow-lg">
          <p className="px-2 pb-2 text-xs font-bold text-slate-500">选择消耗数量</p>
          <div className="grid grid-cols-3 gap-1">
            {[0.5, 1, 2].map((quantity) => (
              <button
                key={quantity}
                className="min-h-10 rounded-md bg-[var(--color-primary-soft)] px-2 text-sm font-bold text-[var(--color-primary-strong)] hover:bg-[var(--color-muted)] disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                disabled={isPending}
                onClick={() => consume(quantity)}
              >
                {formatQuantity(quantity)}
                {unit}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              aria-label="自定义消耗数量"
              className="min-h-10 min-w-0 flex-1 rounded-md border border-slate-300 px-2 text-sm text-slate-950"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              type="number"
              value={customQuantity}
              onChange={(event) => setCustomQuantity(event.target.value)}
            />
            <button
              className="min-h-10 rounded-md bg-slate-950 px-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              type="button"
              disabled={isPending || !canUseCustomQuantity}
              onClick={() => consume(parsedCustomQuantity)}
            >
              确定
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
