import { shipDatabase, type ShipType } from "./shipDatabase";

export interface FleetInput {
  light: number;
  medium: number;
  heavy: number;
}

export interface BattleResult {
  fleetATotalPower: number;
  fleetBTotalPower: number;
  winner: "Fleet A" | "Fleet B" | "Draw";
  remainingPower: number;
}

export function calculateFleetPower(fleet: FleetInput): number {
  return (Object.keys(shipDatabase) as ShipType[]).reduce((total, shipType) => {
    return total + fleet[shipType] * shipDatabase[shipType].power;
  }, 0);
}

export function resolveCombat(fleetA: FleetInput, fleetB: FleetInput): BattleResult {
  const fleetATotalPower = calculateFleetPower(fleetA);
  const fleetBTotalPower = calculateFleetPower(fleetB);

  if (fleetATotalPower === fleetBTotalPower) {
    return {
      fleetATotalPower,
      fleetBTotalPower,
      winner: "Draw",
      remainingPower: 0
    };
  }

  const winner = fleetATotalPower > fleetBTotalPower ? "Fleet A" : "Fleet B";

  return {
    fleetATotalPower,
    fleetBTotalPower,
    winner,
    remainingPower: Math.abs(fleetATotalPower - fleetBTotalPower)
  };
}
