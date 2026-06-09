import { describe, expect, it } from "vitest";
import { countOuts } from "@/lib/poker/postflop/outs-calculator";
import { evaluateHandStrength } from "@/lib/poker/postflop/board-analyzer";
import { validatePostflopAction } from "@/lib/poker/postflop/postflop-validator";
import { Scenario } from "@/lib/poker/types";

const HOLE: Scenario["holeCards"] = [
  { rank: "5", suit: "h" },
  { rank: "6", suit: "d" },
];

const BOARD: Scenario["board"] = [
  { rank: "Q", suit: "h" },
  { rank: "4", suit: "h" },
  { rank: "4", suit: "d" },
];

function scenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: "bug-56o",
    playerCount: "headsUp",
    position: "BTN",
    effectivePosition: "SB",
    stackBB: 20,
    holeCards: HOLE,
    board: BOARD,
    potBB: 4.5,
    street: "flop",
    actionHistory: [],
    zone: "green",
    situationId: "postflop_draw",
    isFirstToAct: false,
    facingAction: "bet_half",
    callAmountBB: 1.5,
    availableActions: ["fold", "call"],
    correctActions: [],
    strategyMode: "standard",
    postflopType: "draw",
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: true,
    villainChecked: false,
    ...overrides,
  };
}

describe("bug: 5h6d on Qh4h4d — air, 0 outs, fold facing bet", () => {
  it("counts 0 outs", () => {
    expect(countOuts(HOLE, BOARD)).toBe(0);
  });

  it("classifies hand as air", () => {
    expect(evaluateHandStrength(HOLE, BOARD)).toBe("air");
  });

  it("recommends fold facing a bet", () => {
    const result = validatePostflopAction(scenario());
    expect(result.correctActions).toEqual(["fold"]);
    expect(result.ruleRef).toBe("postflop_air_fold");
    expect(result.details.outs).toBe(0);
  });

  it("recommends fold even when postflopType is draw", () => {
    const result = validatePostflopAction(
      scenario({ postflopType: "draw", facingAction: "bet_half" })
    );
    expect(result.correctActions).toEqual(["fold"]);
    expect(result.details.outs).toBe(0);
  });
});
