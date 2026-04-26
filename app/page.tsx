"use client";

import { useMemo, useState } from "react";
import { type FleetInput, type BattleResult } from "@/lib/combat";
import { shipDatabase } from "@/lib/shipDatabase";

interface BattleRecord {
  id: number;
  fleetA: FleetInput;
  fleetB: FleetInput;
  result: BattleResult;
}

const shipTypes = ["light", "medium", "heavy"] as const;

const createEmptyFleet = (): FleetInput => ({
  light: 0,
  medium: 0,
  heavy: 0
});

function sanitizeCount(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

function cloneFleet(fleet: FleetInput): FleetInput {
  return { ...fleet };
}

function calculateLocalPower(fleet: FleetInput): number {
  return shipTypes.reduce((total, shipType) => total + fleet[shipType] * shipDatabase[shipType].power, 0);
}

export default function Home() {
  const [fleetA, setFleetA] = useState<FleetInput>(createEmptyFleet());
  const [fleetB, setFleetB] = useState<FleetInput>(createEmptyFleet());
  const [currentResult, setCurrentResult] = useState<BattleResult | null>(null);
  const [battleHistory, setBattleHistory] = useState<BattleRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isResolving, setIsResolving] = useState(false);

  const localFleetAPower = useMemo(() => calculateLocalPower(fleetA), [fleetA]);
  const localFleetBPower = useMemo(() => calculateLocalPower(fleetB), [fleetB]);
  const largestPower = Math.max(localFleetAPower, localFleetBPower, 1);

  const updateFleet = (
    fleetName: "A" | "B",
    shipType: keyof FleetInput,
    value: string
  ) => {
    const nextValue = sanitizeCount(value);

    if (fleetName === "A") {
      setFleetA((previous) => ({ ...previous, [shipType]: nextValue }));
      return;
    }

    setFleetB((previous) => ({ ...previous, [shipType]: nextValue }));
  };

  const resolveBattle = async () => {
    setErrorMessage("");
    setIsResolving(true);

    try {
      const response = await fetch("/api/resolve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fleetA, fleetB })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to resolve battle.");
      }

      const payload = (await response.json()) as { result: BattleResult };
      setCurrentResult(payload.result);

      const battleRecord: BattleRecord = {
        id: Date.now(),
        fleetA: cloneFleet(fleetA),
        fleetB: cloneFleet(fleetB),
        result: payload.result
      };

      setBattleHistory((previous) => [battleRecord, ...previous]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setIsResolving(false);
    }
  };

  const resetInputs = () => {
    setFleetA(createEmptyFleet());
    setFleetB(createEmptyFleet());
    setCurrentResult(null);
    setErrorMessage("");
  };

  return (
    <main>
      <h1>Fleet Combat Auto Resolver (Next.js)</h1>
      <p>
        This is a Next.js app. Ship totals are submitted to a Next.js API route,
        then resolved as <code>higher total - lower total = remaining power</code>.
      </p>

      <section className="card">
        <h2>Ship Database</h2>
        <ul>
          {Object.values(shipDatabase).map((ship) => (
            <li key={ship.name}>
              {ship.name} = {ship.power}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Visual Battle Representation</h2>
        <p>Live view of fleet composition and relative total power before you resolve.</p>

        <div className="powerCompare">
          <div>
            <strong>Fleet A Power: {localFleetAPower}</strong>
            <div className="powerBarOuter">
              <div className="powerBar fleetABar" style={{ width: `${(localFleetAPower / largestPower) * 100}%` }} />
            </div>
          </div>
          <div>
            <strong>Fleet B Power: {localFleetBPower}</strong>
            <div className="powerBarOuter">
              <div className="powerBar fleetBBar" style={{ width: `${(localFleetBPower / largestPower) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="grid">
          <div>
            <h3>Fleet A Composition</h3>
            {shipTypes.map((shipType) => (
              <div key={`a-viz-${shipType}`} className="shipVizRow">
                <span>{shipDatabase[shipType].name}</span>
                <div className="powerBarOuter">
                  <div
                    className="powerBar shipTypeBar"
                    style={{ width: `${Math.min(fleetA[shipType] * 10, 100)}%` }}
                  />
                </div>
                <span>{fleetA[shipType]}</span>
              </div>
            ))}
          </div>
          <div>
            <h3>Fleet B Composition</h3>
            {shipTypes.map((shipType) => (
              <div key={`b-viz-${shipType}`} className="shipVizRow">
                <span>{shipDatabase[shipType].name}</span>
                <div className="powerBarOuter">
                  <div
                    className="powerBar shipTypeBar"
                    style={{ width: `${Math.min(fleetB[shipType] * 10, 100)}%` }}
                  />
                </div>
                <span>{fleetB[shipType]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid">
        <section className="card">
          <h2>Fleet A Input</h2>
          {shipTypes.map((ship) => (
            <div className="field" key={`a-${ship}`}>
              <label htmlFor={`a-${ship}`}>{ship[0].toUpperCase() + ship.slice(1)} Ships</label>
              <input
                id={`a-${ship}`}
                type="number"
                min={0}
                value={fleetA[ship]}
                onChange={(event) => updateFleet("A", ship, event.target.value)}
              />
            </div>
          ))}
        </section>

        <section className="card">
          <h2>Fleet B Input</h2>
          {shipTypes.map((ship) => (
            <div className="field" key={`b-${ship}`}>
              <label htmlFor={`b-${ship}`}>{ship[0].toUpperCase() + ship.slice(1)} Ships</label>
              <input
                id={`b-${ship}`}
                type="number"
                min={0}
                value={fleetB[ship]}
                onChange={(event) => updateFleet("B", ship, event.target.value)}
              />
            </div>
          ))}
        </section>
      </div>

      <section className="card">
        <h2>Resolve Battle</h2>
        {errorMessage ? <p className="error">{errorMessage}</p> : null}
        <div className="actions">
          <button type="button" onClick={resolveBattle} disabled={isResolving}>
            {isResolving ? "Resolving..." : "Resolve & Save Battle"}
          </button>
          <button type="button" onClick={resetInputs} className="secondary">
            Reset Inputs
          </button>
        </div>

        {currentResult ? (
          <>
            <p>Fleet A total power: {currentResult.fleetATotalPower}</p>
            <p>Fleet B total power: {currentResult.fleetBTotalPower}</p>
            {currentResult.winner === "Draw" ? (
              <p className="result">Draw: both fleets are destroyed (remaining power 0).</p>
            ) : (
              <p className="result">
                Winner: {currentResult.winner}, remaining power: {currentResult.remainingPower}
              </p>
            )}
          </>
        ) : (
          <p>No battle resolved yet.</p>
        )}
      </section>

      <section className="card">
        <h2>All Battles History</h2>
        {battleHistory.length === 0 ? (
          <p>No battles saved yet.</p>
        ) : (
          <ol className="historyList">
            {battleHistory.map((battle) => (
              <li key={battle.id}>
                A({battle.result.fleetATotalPower}) vs B({battle.result.fleetBTotalPower}) →{" "}
                {battle.result.winner === "Draw"
                  ? "Draw (0 left)"
                  : `${battle.result.winner} wins with ${battle.result.remainingPower} left`}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
