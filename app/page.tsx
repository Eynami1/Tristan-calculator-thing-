"use client";

import { useMemo, useState } from "react";
import { resolveCombat, type FleetInput } from "@/lib/combat";
import { shipDatabase } from "@/lib/shipDatabase";

interface BattleRecord {
  id: number;
  fleetA: FleetInput;
  fleetB: FleetInput;
  result: ReturnType<typeof resolveCombat>;
}

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
  return {
    light: fleet.light,
    medium: fleet.medium,
    heavy: fleet.heavy
  };
}

export default function Home() {
  const [fleetA, setFleetA] = useState<FleetInput>(createEmptyFleet());
  const [fleetB, setFleetB] = useState<FleetInput>(createEmptyFleet());
  const [battleHistory, setBattleHistory] = useState<BattleRecord[]>([]);

  const liveResult = useMemo(() => resolveCombat(fleetA, fleetB), [fleetA, fleetB]);

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

  const saveBattle = () => {
    const nextRecord: BattleRecord = {
      id: Date.now(),
      fleetA: cloneFleet(fleetA),
      fleetB: cloneFleet(fleetB),
      result: liveResult
    };

    setBattleHistory((previous) => [nextRecord, ...previous]);
  };

  const resetInputs = () => {
    setFleetA(createEmptyFleet());
    setFleetB(createEmptyFleet());
  };

  return (
    <main>
      <h1>Fleet Combat Auto Resolver (Next.js)</h1>
      <p>
        Enter ships for each fleet, then resolve battles. Winner is based on total power,
        and remaining power is calculated as <code>higher total - lower total</code>.
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

      <div className="grid">
        <section className="card">
          <h2>Fleet A Input</h2>
          <div className="field">
            <label htmlFor="a-light">Light Ships</label>
            <input
              id="a-light"
              type="number"
              min={0}
              value={fleetA.light}
              onChange={(event) => updateFleet("A", "light", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="a-medium">Medium Ships</label>
            <input
              id="a-medium"
              type="number"
              min={0}
              value={fleetA.medium}
              onChange={(event) => updateFleet("A", "medium", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="a-heavy">Heavy Ships</label>
            <input
              id="a-heavy"
              type="number"
              min={0}
              value={fleetA.heavy}
              onChange={(event) => updateFleet("A", "heavy", event.target.value)}
            />
          </div>
        </section>

        <section className="card">
          <h2>Fleet B Input</h2>
          <div className="field">
            <label htmlFor="b-light">Light Ships</label>
            <input
              id="b-light"
              type="number"
              min={0}
              value={fleetB.light}
              onChange={(event) => updateFleet("B", "light", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="b-medium">Medium Ships</label>
            <input
              id="b-medium"
              type="number"
              min={0}
              value={fleetB.medium}
              onChange={(event) => updateFleet("B", "medium", event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="b-heavy">Heavy Ships</label>
            <input
              id="b-heavy"
              type="number"
              min={0}
              value={fleetB.heavy}
              onChange={(event) => updateFleet("B", "heavy", event.target.value)}
            />
          </div>
        </section>
      </div>

      <section className="card">
        <h2>Current Battle Result</h2>
        <p>Fleet A total power: {liveResult.fleetATotalPower}</p>
        <p>Fleet B total power: {liveResult.fleetBTotalPower}</p>
        {liveResult.winner === "Draw" ? (
          <p className="result">Draw: both fleets are destroyed (remaining power 0).</p>
        ) : (
          <p className="result">
            Winner: {liveResult.winner}, remaining power: {liveResult.remainingPower}
          </p>
        )}
        <div className="actions">
          <button type="button" onClick={saveBattle}>
            Save Battle to History
          </button>
          <button type="button" onClick={resetInputs} className="secondary">
            Reset Inputs
          </button>
        </div>
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
