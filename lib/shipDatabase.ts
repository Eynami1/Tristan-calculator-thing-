export type ShipType = "light" | "medium" | "heavy";

export interface ShipInfo {
  name: string;
  power: number;
}

// Simple local database mapping each ship type to power.
export const shipDatabase: Record<ShipType, ShipInfo> = {
  light: { name: "Light Ship", power: 1 },
  medium: { name: "Medium Ship", power: 3 },
  heavy: { name: "Heavy Ship", power: 6 }
};
