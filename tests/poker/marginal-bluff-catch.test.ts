import { describe, expect, it } from "vitest";
import { evaluateHandStrength } from "@/lib/poker/postflop/board-analyzer";
import { validatePostflopAction } from "@/lib/poker/postflop/postflop-validator";
import { Scenario } from "@/lib/poker/types";

const HOLE_KTO: Scenario["holeCards"] = [
  { rank: "K", suit: "h" },
  { rank: "T", suit: "d" },
];

const BOARD_TURN: Scenario["board"] = [
  { rank: "2", suit: "h" },
  { rank: "7", suit: "d" },
  { rank: "6", suit: "h" },
  { rank: "K", suit: "d" },
];

function ktoTurnFacingBet(overrides: Partial<Scenario> = {}): Scenario {
  return {
    id: "kto-turn",
    playerCount: "headsUp",
    position: "BTN",
    effectivePosition: "SB",
    stackBB: 20,
    holeCards: HOLE_KTO,
    board: BOARD_TURN,
    potBB: 5,
    street: "turn",
    actionHistory: [
      { actor: "hero", action: "raise_2bb", amountBB: 2, street: "preflop" },
      { actor: "villain", action: "call", street: "preflop" },
      { actor: "hero", action: "check", street: "flop" },
      { actor: "villain", action: "check", street: "flop" },
      { actor: "villain", action: "bet_half", amountBB: 1.5, street: "turn" },
    ],
    zone: "green",
    situationId: "postflop_facing_bet",
    isFirstToAct: false,
    facingAction: "bet_half",
    callAmountBB: 1.5,
    availableActions: ["fold", "call", "raise_6bb"],
    correctActions: [],
    strategyMode: "standard",
    postflopType: "facing_bet",
    heroWasPreflopAggressor: true,
    isHeadsUpPostflop: true,
    villainChecked: false,
    ...overrides,
  };
}

describe("marginal bluff-catcher facing standard bet", () => {
  it("classifies KTo top pair T kicker as marginal on connected board", () => {
    const strength = evaluateHandStrength(HOLE_KTO, BOARD_TURN);
    expect(strength).toBe("marginal");
    expect(strength).not.toBe("weak");
    expect(strength).not.toBe("air");
  });

  it("recommends Call (not Fold) facing 1/2 pot bet on turn", () => {
    const result = validatePostflopAction(ktoTurnFacingBet());
    expect(result.correctActions).toEqual(["call"]);
    expect(result.ruleRef).toBe("postflop_marginal_call");
    expect(result.correctActions).not.toContain("fold");
  });

  it("still folds air facing bet", () => {
    const result = validatePostflopAction(
      ktoTurnFacingBet({
        holeCards: [
          { rank: "Q", suit: "h" },
          { rank: "J", suit: "d" },
        ],
        postflopType: "air",
      })
    );
    expect(result.correctActions).toContain("fold");
    expect(result.ruleRef).toBe("postflop_air_fold");
  });
});
