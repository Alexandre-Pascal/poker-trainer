import { describe, expect, it } from "vitest";
import { validateAction } from "@/lib/poker/action-validator";
import { Scenario } from "@/lib/poker/types";

function preflopScenario(
  hole: [Scenario["holeCards"][0], Scenario["holeCards"][1]],
  overrides: Partial<Scenario>
): Scenario {
  const base: Scenario = {
    id: "test",
    playerCount: "3max",
    position: "BTN",
    effectivePosition: "BTN",
    stackBB: 20,
    holeCards: hole,
    board: [],
    potBB: 1.5,
    street: "preflop",
    actionHistory: [],
    zone: "green",
    situationId: "green_btn_open",
    isFirstToAct: true,
    facingAction: null,
    callAmountBB: 0,
    availableActions: ["fold", "raise_2bb"],
    correctActions: [],
    strategyMode: "standard",
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: false,
    villainChecked: false,
  };
  return { ...base, ...overrides };
}

describe("action-validator preflop", () => {
  it("raises AKs on BTN 20 BB", () => {
    const s = preflopScenario(
      [
        { rank: "A", suit: "s" },
        { rank: "K", suit: "s" },
      ],
      {}
    );
    const r = validateAction(s, "raise_2bb");
    expect(r.isCorrect).toBe(true);
  });

  it("folds 72o on BTN 20 BB", () => {
    const s = preflopScenario(
      [
        { rank: "7", suit: "h" },
        { rank: "2", suit: "d" },
      ],
      {}
    );
    const r = validateAction(s, "fold");
    expect(r.isCorrect).toBe(true);
  });

  it("pushes 88 at 8 BB BTN", () => {
    const s = preflopScenario(
      [
        { rank: "8", suit: "h" },
        { rank: "8", suit: "d" },
      ],
      { stackBB: 8, zone: "red", strategyMode: "push_fold" }
    );
    const r = validateAction(s, "allin");
    expect(r.isCorrect).toBe(true);
  });

  it("BB checks with weak hand vs limp", () => {
    const s = preflopScenario(
      [
        { rank: "7", suit: "h" },
        { rank: "2", suit: "d" },
      ],
      {
        position: "BB",
        effectivePosition: "BB",
        isFirstToAct: true,
        facingAction: "limp",
        actionHistory: [{ actor: "BTN", action: "limp" }],
        situationId: "green_bb_vs_limp",
      }
    );
    const r = validateAction(s, "check");
    expect(r.isCorrect).toBe(true);
  });
});
