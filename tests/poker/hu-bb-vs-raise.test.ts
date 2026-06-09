import { describe, expect, it } from "vitest";
import { validateAction } from "@/lib/poker/action-validator";
import { findRangeRule } from "@/lib/poker/ranges";
import { computePreflopPotBB } from "@/lib/poker/pot-calculator";
import { Scenario } from "@/lib/poker/types";

function huBbVsRaiseScenario(): Scenario {
  return {
    id: "hu-bb-vs-raise",
    playerCount: "headsUp",
    position: "BB",
    effectivePosition: "BB",
    stackBB: 20,
    holeCards: [
      { rank: "8", suit: "s" },
      { rank: "3", suit: "s" },
    ],
    board: [],
    potBB: 3,
    street: "preflop",
    actionHistory: [
      { actor: "villain", action: "raise_2bb", amountBB: 2, street: "preflop" },
    ],
    zone: "green",
    situationId: "green_bb_vs_raise",
    isFirstToAct: false,
    facingAction: "raise_2bb",
    callAmountBB: 1,
    availableActions: ["fold", "call", "raise_6bb"],
    correctActions: [],
    strategyMode: "standard",
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: false,
    villainChecked: false,
  };
}

describe("HU BB vs raise", () => {
  it("finds green_bb_vs_raise rule with villain actor", () => {
    const scenario = huBbVsRaiseScenario();
    const rule = findRangeRule(
      scenario.effectivePosition,
      scenario.strategyMode,
      scenario.actionHistory,
      scenario.playerCount
    );
    expect(rule?.situationId).toBe("green_bb_vs_raise");
  });

  it("computes pot as 3 BB when villain raised to 2 BB and hero is BB", () => {
    const pot = computePreflopPotBB(
      "headsUp",
      "BB",
      [{ actor: "villain", action: "raise_2bb", amountBB: 2 }],
      "raise_2bb",
      false
    );
    expect(pot).toBe(3);
  });

  it("folds 83s with pedagogical explanation", () => {
    const result = validateAction(huBbVsRaiseScenario(), "fold");
    expect(result.isCorrect).toBe(true);
    expect(result.ruleRef).toBe("green_bb_vs_raise");
    expect(result.explanation).toContain("84s+ requis");
    expect(result.explanation).not.toContain("non reconnue");
  });

  it("rejects call with 83s", () => {
    const result = validateAction(huBbVsRaiseScenario(), "call");
    expect(result.isCorrect).toBe(false);
    expect(result.correctActions).toContain("fold");
    expect(result.explanation).toContain("84s+ requis");
  });
});
