import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ManualEntryPanel } from "@/components/add/ManualEntryPanel";

vi.mock("@/lib/server/foods", () => ({
  createFood: vi.fn(),
}));

describe("ManualEntryPanel", () => {
  it("preselects a location when adding from a cabinet", () => {
    render(
      <ManualEntryPanel
        familyId="demo"
        locations={[{ id: "loc-1", name: "妈妈零食柜" }]}
        initialLocationId="loc-1"
      />,
    );

    expect(screen.getByLabelText("存放位置")).toHaveValue("loc-1");
  });
});
