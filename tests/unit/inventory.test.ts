import { describe, expect, it } from "vitest";
import { applyInventoryAction } from "@/lib/domain/inventory";

describe("applyInventoryAction", () => {
  it("reduces quantity when an item is taken", () => {
    const result = applyInventoryAction(
      { id: "f1", name: "蛋黄派", quantity: 3, unit: "包", status: "active" },
      { type: "take", quantity: 1 },
    );
    expect(result).toMatchObject({ quantity: 2, status: "active" });
  });

  it("marks item as finished when finishing all quantity", () => {
    const result = applyInventoryAction(
      { id: "f1", name: "牛奶", quantity: 1, unit: "箱", status: "active" },
      { type: "finish" },
    );
    expect(result).toMatchObject({ quantity: 0, status: "finished" });
  });
});
