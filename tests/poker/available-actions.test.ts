import { describe, expect, it } from "vitest";
import { getAvailableActions } from "@/lib/poker/available-actions";
import { Scenario } from "@/lib/poker/types";

function baseScenario(overrides: Partial<Scenario>): Scenario {
  return {
    id: "test",
    playerCount: "3max",
    position: "BB",
    effectivePosition: "BB",
    stackBB: 20,
    holeCards: [
      { rank: "A", suit: "s" },
      { rank: "K", suit: "s" },
    ],
    board: [],
    potBB: 3,
    street: "preflop",
    actionHistory: [],
    zone: "green",
    situationId: "test",
    isFirstToAct: false,
    facingAction: null,
    callAmountBB: 0,
    availableActions: [],
    correctActions: [],
    strategyMode: "standard",
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: false,
    villainChecked: false,
    ...overrides,
  };
}

describe("available-actions", () => {
  it("only fold and call facing all-in", () => {
    const actions = getAvailableActions(
      baseScenario({ facingAction: "allin", callAmountBB: 8 })
    );
    expect(actions).toEqual(["fold", "call"]);
  });

  it("no check preflop first to act BTN", () => {
    const actions = getAvailableActions(
      baseScenario({
        position: "BTN",
        effectivePosition: "BTN",
        isFirstToAct: true,
      })
    );
    expect(actions).not.toContain("check");
    expect(actions).toContain("raise_2bb");
  });

  it("push fold zone first to act", () => {
    const actions = getAvailableActions(
      baseScenario({
        stackBB: 8,
        zone: "red",
        position: "BTN",
        effectivePosition: "BTN",
        isFirstToAct: true,
        strategyMode: "push_fold",
      })
    );
    expect(actions).toEqual(["fold", "allin"]);
  });

  it("BB vs limp can check or raise", () => {
    const actions = getAvailableActions(
      baseScenario({
        effectivePosition: "BB",
        isFirstToAct: true,
        facingAction: "limp",
      })
    );
    expect(actions).toContain("check");
    expect(actions).toContain("raise_4bb");
  });

  it("postflop villain checked", () => {
    const actions = getAvailableActions(
      baseScenario({
        street: "flop",
        villainChecked: true,
        facingAction: null,
        board: [
          { rank: "K", suit: "h" },
          { rank: "7", suit: "d" },
          { rank: "2", suit: "c" },
        ],
      })
    );
    expect(actions).toEqual(["check", "bet_third", "bet_half"]);
  });

  it("postflop facing bet", () => {
    const actions = getAvailableActions(
      baseScenario({
        street: "flop",
        facingAction: "bet_half",
        callAmountBB: 2,
        board: [
          { rank: "K", suit: "h" },
          { rank: "7", suit: "d" },
          { rank: "2", suit: "c" },
        ],
      })
    );
    expect(actions).toContain("fold");
    expect(actions).toContain("call");
    expect(actions).not.toContain("check");
  });
});
