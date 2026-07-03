export type InventoryFood = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: "active" | "taken" | "finished" | "discarded";
};

export type InventoryAction =
  | { type: "take"; quantity: number }
  | { type: "finish" }
  | { type: "discard" };

export function applyInventoryAction(food: InventoryFood, action: InventoryAction): InventoryFood {
  if (action.type === "take") {
    const nextQuantity = Math.max(0, food.quantity - action.quantity);
    return { ...food, quantity: nextQuantity, status: nextQuantity === 0 ? "taken" : "active" };
  }

  if (action.type === "finish") {
    return { ...food, quantity: 0, status: "finished" };
  }

  return { ...food, quantity: 0, status: "discarded" };
}
