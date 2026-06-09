import { describe, expect, it } from "vitest";
import { validatePostflopAction } from "@/lib/poker/postflop/postflop-validator";
import { Scenario } from "@/lib/poker/types";

function postflop(overrides: Partial<Scenario>): Scenario {
  return {
    id: "test",
    playerCount: "headsUp",
    position: "BTN",
    effectivePosition: "SB",
    stackBB: 20,
    holeCards: [
      { rank: "A", suit: "h" },
      { rank: "K", suit: "h" },
    ],
    board: [
      { rank: "K", suit: "d" },
      { rank: "7", suit: "c" },
      { rank: "2", suit: "s" },
    ],
    potBB: 4.5,
    street: "flop",
    actionHistory: [],
    zone: "green",
    situationId: "postflop_cbet",
    isFirstToAct: false,
    facingAction: null,
    callAmountBB: 0,
    availableActions: [],
    correctActions: [],
    strategyMode: "standard",
    postflopType: "cbet",
    heroWasPreflopAggressor: true,
    isHeadsUpPostflop: true,
    villainChecked: true,
    ...overrides,
  };
}

describe("postflop-validator", () => {
  it("recommends cbet when villain checks on dry board", () => {
    const r = validatePostflopAction(
      postflop({
        holeCards: [
          { rank: "Q", suit: "h" },
          { rank: "J", suit: "d" },
        ],
      })
    );
    expect(r.correctActions).toContain("bet_third");
  });

  it("recommends fold with air facing bet", () => {
    const r = validatePostflopAction(
      postflop({
        postflopType: "air",
        villainChecked: false,
        facingAction: "bet_half",
        callAmountBB: 2,
        holeCards: [
          { rank: "Q", suit: "h" },
          { rank: "J", suit: "d" },
        ],
      })
    );
    expect(r.correctActions).toContain("fold");
  });
});
