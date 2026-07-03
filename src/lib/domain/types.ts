export type FoodStatus = "active" | "taken" | "finished" | "discarded";

export type FoodSummary = {
  id: string;
  name: string;
  expiresAt: string;
  status: FoodStatus;
  locationId: string;
  quantity: number;
  unit: string;
};
