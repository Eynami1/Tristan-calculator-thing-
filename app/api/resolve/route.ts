import { NextResponse } from "next/server";
import { resolveCombat, type FleetInput } from "@/lib/combat";

interface ResolvePayload {
  fleetA: FleetInput;
  fleetB: FleetInput;
}

function isValidFleet(fleet: FleetInput): boolean {
  return (
    Number.isInteger(fleet.light) &&
    Number.isInteger(fleet.medium) &&
    Number.isInteger(fleet.heavy) &&
    fleet.light >= 0 &&
    fleet.medium >= 0 &&
    fleet.heavy >= 0
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as ResolvePayload;

  if (!body?.fleetA || !body?.fleetB || !isValidFleet(body.fleetA) || !isValidFleet(body.fleetB)) {
    return NextResponse.json(
      { error: "Invalid fleet payload. Provide non-negative integers for all ship counts." },
      { status: 400 }
    );
  }

  const result = resolveCombat(body.fleetA, body.fleetB);
  return NextResponse.json({ result });
}
