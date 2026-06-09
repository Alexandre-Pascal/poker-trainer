import { describe, expect, it } from "vitest";
import { validateAction, resolveCorrectActions } from "@/lib/poker/action-validator";
import { isHandInRange, parseHand } from "@/lib/poker/hand-matcher";
import { PUSH_HU_MAX_PRESSURE } from "@/lib/poker/ranges/push-fold";
import { Scenario } from "@/lib/poker/types";

function huPushScenario(
  hole: [Scenario["holeCards"][0], Scenario["holeCards"][1]],
  overrides: Partial<Scenario> = {}
): Scenario {
  return {
    id: "hu-push",
    playerCount: "headsUp",
    position: "BTN",
    effectivePosition: "SB",
    stackBB: 9,
    holeCards: hole,
    board: [],
    potBB: 1.5,
    street: "preflop",
    actionHistory: [],
    zone: "red",
    situationId: "preflop_hu_survival",
    isFirstToAct: true,
    facingAction: null,
    callAmountBB: 0,
    availableActions: ["fold", "allin"],
    correctActions: [],
    strategyMode: "hu_survival",
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: false,
    villainChecked: false,
    ...overrides,
  };
}

describe("HU max pressure push (top 80%)", () => {
  it("84o is outside the range", () => {
    expect(isHandInRange(parseHand("84o"), PUSH_HU_MAX_PRESSURE)).toBe(false);
  });

  it("85s is inside the range", () => {
    expect(isHandInRange(parseHand("85s"), PUSH_HU_MAX_PRESSURE)).toBe(true);
  });

  it("folds 84o in Heads-Up push spot", () => {
    const scenario = huPushScenario([
      { rank: "8", suit: "h" },
      { rank: "4", suit: "d" },
    ]);
    const result = validateAction(scenario, "fold");
    expect(result.isCorrect).toBe(true);
    expect(result.ruleRef).toBe("push_hu_max_pressure");
    expect(result.explanation).toContain("20% de poubelles");
    expect(resolveCorrectActions(scenario)).toEqual(["fold"]);
  });

  it("pushes 85s in Heads-Up push spot", () => {
    const scenario = huPushScenario([
      { rank: "8", suit: "s" },
      { rank: "5", suit: "s" },
    ]);
    const result = validateAction(scenario, "allin");
    expect(result.isCorrect).toBe(true);
    expect(result.ruleRef).toBe("push_hu_max_pressure");
    expect(result.explanation).toContain("pression doit être maximale");
    expect(resolveCorrectActions(scenario)).toEqual(["allin"]);
  });
});
