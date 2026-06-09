import { describe, expect, it } from "vitest";
import {
  evaluateHandStrength,
  getBoardPairType,
} from "@/lib/poker/postflop/board-analyzer";
import { validatePostflopAction } from "@/lib/poker/postflop/postflop-validator";
import { Scenario } from "@/lib/poker/types";

const HOLE_A9O: Scenario["holeCards"] = [
  { rank: "A", suit: "h" },
  { rank: "9", suit: "d" },
];

const BOARD_J96: Scenario["board"] = [
  { rank: "J", suit: "c" },
  { rank: "9", suit: "h" },
  { rank: "6", suit: "s" },
];

function a9FlopFacingHalfPot(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: "a9-middle-pair",
    playerCount: "headsUp",
    position: "BB",
    effectivePosition: "BB",
    stackBB: 20,
    holeCards: HOLE_A9O,
    board: BOARD_J96,
    potBB: 4,
    street: "flop",
    actionHistory: [
      { actor: "villain", action: "raise_2bb", amountBB: 2, street: "preflop" },
      { actor: "hero", action: "call", street: "preflop" },
      { actor: "villain", action: "bet_half", amountBB: 2, street: "flop" },
    ],
    zone: "green",
    situationId: "postflop_facing_bet",
    isFirstToAct: false,
    facingAction: "bet_half",
    callAmountBB: 2,
    availableActions: ["fold", "call", "raise_6bb"],
    correctActions: [],
    strategyMode: "standard",
    postflopType: "facing_bet",
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: true,
    villainChecked: false,
    ...overrides,
  };
}

describe("A9o middle pair on J-9-6", () => {
  it("detects middle pair (not top pair)", () => {
    expect(getBoardPairType(HOLE_A9O, BOARD_J96)).toBe("middle");
  });

  it("classifies as marginal, not air or weak", () => {
    const strength = evaluateHandStrength(HOLE_A9O, BOARD_J96);
    expect(strength).toBe("marginal");
    expect(strength).not.toBe("air");
    expect(strength).not.toBe("weak");
  });

  it("recommends Call facing 1/2 pot bet", () => {
    const result = validatePostflopAction(a9FlopFacingHalfPot());
    expect(result.correctActions).toEqual(["call"]);
    expect(result.ruleRef).toBe("postflop_marginal_call");
    expect(result.details.strength).toBe("marginal");
  });
});
