"use client";

import { AddFoodConfirmForm } from "./AddFoodConfirmForm";

export function ManualEntryPanel({
  familyId,
  locations,
  initialLocationId = "",
}: {
  familyId: string;
  locations: Array<{ id: string; name: string }>;
  initialLocationId?: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">手动添加</h2>
      <AddFoodConfirmForm
        familyId={familyId}
        locations={locations}
        draft={{ name: "", quantity: 1, unit: "件", locationId: initialLocationId, expiresAt: "", source: "manual" }}
      />
    </section>
  );
}
