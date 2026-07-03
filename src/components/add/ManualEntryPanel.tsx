"use client";

import { AddFoodConfirmForm } from "./AddFoodConfirmForm";

export function ManualEntryPanel({
  familyId,
  locations,
}: {
  familyId: string;
  locations: Array<{ id: string; name: string }>;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">手动添加</h2>
      <AddFoodConfirmForm
        familyId={familyId}
        locations={locations}
        draft={{ name: "", quantity: 1, unit: "件", locationId: "", expiresAt: "", source: "manual" }}
      />
    </section>
  );
}
