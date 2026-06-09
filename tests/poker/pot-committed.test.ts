import { describe, expect, it } from "vitest";
import { validateAction, resolveCorrectActions } from "@/lib/poker/action-validator";
import { getAvailableActions } from "@/lib/poker/available-actions";
import {
  isPotCommittedPreflopSpot,
} from "@/lib/poker/pot-committed";
import { Scenario } from "@/lib/poker/types";

function potCommittedScenario(
  hole: [Scenario["holeCards"][0], Scenario["holeCards"][1]],
  overrides: Partial<Scenario> = {}
): Scenario {
  return {
    id: "pot-committed",
    playerCount: "headsUp",
    position: "BB",
    effectivePosition: "BB",
    stackBB: 7,
    holeCards: hole,
    board: [],
    potBB: 3,
    street: "preflop",
    actionHistory: [
      { actor: "villain", action: "raise_2bb", amountBB: 2, street: "preflop" },
    ],
    zone: "red",
    situationId: "preflop_push_fold",
    isFirstToAct: false,
    facingAction: "raise_2bb",
    callAmountBB: 1,
    availableActions: [],
    correctActions: [],
    strategyMode: "push_fold",
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: false,
    villainChecked: false,
    ...overrides,
  };
}

describe("pot-committed preflop", () => {
  it("detects HU BB vs mini-raise in short stack zone", () => {
    const scenario = potCommittedScenario([
      { rank: "8", suit: "h" },
      { rank: "8", suit: "d" },
    ]);
    expect(isPotCommittedPreflopSpot(scenario)).toBe(true);
  });

  it("does not apply in green zone", () => {
    const scenario = potCommittedScenario(
      [
        { rank: "8", suit: "h" },
        { rank: "8", suit: "d" },
      ],
      { stackBB: 20, zone: "green", strategyMode: "standard" }
    );
    expect(isPotCommittedPreflopSpot(scenario)).toBe(false);
  });

  it("pushes 88 facing recreational mini-raise at 7 BB", () => {
    const scenario = potCommittedScenario([
      { rank: "8", suit: "h" },
      { rank: "8", suit: "d" },
    ]);
    const result = validateAction(scenario, "allin");
    expect(result.isCorrect).toBe(true);
    expect(result.ruleRef).toBe("pot_committed_defense");
    expect(result.explanation).toContain("Pot-Committed");
    expect(result.explanation).toContain("range de survie");
  });

  it("folds 72o facing recreational mini-raise at 7 BB", () => {
    const scenario = potCommittedScenario([
      { rank: "7", suit: "h" },
      { rank: "2", suit: "d" },
    ]);
    const result = validateAction(scenario, "fold");
    expect(result.isCorrect).toBe(true);
    expect(resolveCorrectActions(scenario)).toEqual(["fold"]);
  });

  it("rejects call at 2 BB in pot-committed spot", () => {
    const scenario = potCommittedScenario([
      { rank: "8", suit: "h" },
      { rank: "8", suit: "d" },
    ]);
    const result = validateAction(scenario, "call");
    expect(result.isCorrect).toBe(false);
    expect(result.correctActions).toEqual(["allin"]);
  });

  it("offers only fold and all-in as available actions", () => {
    const scenario = potCommittedScenario([
      { rank: "A", suit: "s" },
      { rank: "K", suit: "s" },
    ]);
    expect(getAvailableActions(scenario)).toEqual(["fold", "allin"]);
  });

  it("applies to BB vs limp in yellow zone", () => {
    const scenario = potCommittedScenario(
      [
        { rank: "K", suit: "h" },
        { rank: "J", suit: "d" },
      ],
      {
        stackBB: 12,
        zone: "yellow",
        isFirstToAct: true,
        facingAction: "limp",
        actionHistory: [{ actor: "villain", action: "limp", street: "preflop" }],
      }
    );
    expect(isPotCommittedPreflopSpot(scenario)).toBe(true);
    const result = validateAction(scenario, "allin");
    expect(result.isCorrect).toBe(true);
    expect(getAvailableActions(scenario)).toEqual(["fold", "allin"]);
  });
});
