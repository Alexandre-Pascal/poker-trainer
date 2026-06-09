import { describe, expect, it } from "vitest";
import { validateAction, resolveCorrectActions } from "@/lib/poker/action-validator";
import { findRangeRule } from "@/lib/poker/ranges";
import { generatePreflopScenario } from "@/lib/poker/scenario-generator";
import { Scenario } from "@/lib/poker/types";

function scenario(
  overrides: Partial<Scenario> & Pick<Scenario, "holeCards">
): Scenario {
  const base: Scenario = {
    id: "short-stack",
    playerCount: "3max",
    position: "SB",
    effectivePosition: "SB",
    stackBB: 8,
    holeCards: overrides.holeCards,
    board: [],
    potBB: 3,
    street: "preflop",
    actionHistory: [{ actor: "BTN", action: "raise_2bb", amountBB: 2 }],
    zone: "red",
    situationId: "test",
    isFirstToAct: false,
    facingAction: "raise_2bb",
    callAmountBB: 1.5,
    availableActions: ["fold", "allin"],
    correctActions: [],
    strategyMode: "push_fold",
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: false,
    villainChecked: false,
  };
  return { ...base, ...overrides };
}

describe("short stack yellow/red scenarios", () => {
  it("BB vs BTN raise at 10 BB: re-jams 77", () => {
    const s = scenario({
      position: "BB",
      effectivePosition: "BB",
      stackBB: 10,
      actionHistory: [
        { actor: "BTN", action: "raise_2bb", amountBB: 2 },
        { actor: "SB", action: "fold" },
      ],
      holeCards: [
        { rank: "7", suit: "h" },
        { rank: "7", suit: "d" },
      ],
    });
    const result = validateAction(s, "allin");
    expect(result.isCorrect).toBe(true);
    expect(result.ruleRef).toBe("bb_rejam_short");
  });

  it("BB vs limp at 9 BB: checks 72o", () => {
    const s = scenario({
      position: "BB",
      effectivePosition: "BB",
      stackBB: 9,
      isFirstToAct: true,
      facingAction: "limp",
      callAmountBB: 0,
      actionHistory: [
        { actor: "BTN", action: "limp" },
        { actor: "SB", action: "fold" },
      ],
      holeCards: [
        { rank: "7", suit: "h" },
        { rank: "2", suit: "d" },
      ],
    });
    expect(validateAction(s, "check").isCorrect).toBe(true);
    expect(validateAction(s, "allin").isCorrect).toBe(false);
  });

  it("SB vs BTN raise at 8 BB: jams 88 (pot-committed, push SB range)", () => {
    const s = scenario({
      holeCards: [
        { rank: "8", suit: "h" },
        { rank: "8", suit: "d" },
      ],
    });
    const result = validateAction(s, "allin");
    expect(result.isCorrect).toBe(true);
    expect(result.ruleRef).toBe("sb_pot_committed");
  });

  it("SB vs BTN all-in at 11 BB: finds sb_defense_allin rule", () => {
    const s = scenario({
      stackBB: 11,
      zone: "yellow",
      facingAction: "allin",
      callAmountBB: 9,
      actionHistory: [{ actor: "BTN", action: "allin", amountBB: 10 }],
      holeCards: [
        { rank: "A", suit: "h" },
        { rank: "9", suit: "d" },
      ],
    });
    const rule = findRangeRule(
      s.effectivePosition,
      s.strategyMode,
      s.actionHistory,
      s.playerCount
    );
    expect(rule?.situationId).toBe("sb_defense_allin");
    expect(validateAction(s, "call").isCorrect).toBe(true);
  });

  it("BTN wide push at 11 BB: finds push_btn_wide rule", () => {
    const s = scenario({
      position: "BTN",
      effectivePosition: "BTN",
      stackBB: 11,
      zone: "yellow",
      strategyMode: "wide_push",
      isFirstToAct: true,
      facingAction: null,
      callAmountBB: 0,
      actionHistory: [],
      holeCards: [
        { rank: "A", suit: "h" },
        { rank: "K", suit: "d" },
      ],
    });
    const rule = findRangeRule(
      s.effectivePosition,
      s.strategyMode,
      s.actionHistory,
      s.playerCount
    );
    expect(rule?.situationId).toBe("push_btn_wide");
    expect(resolveCorrectActions(s)).toEqual(["allin"]);
  });

  it("BB at 12 BB can face BTN shove in generated scenarios", () => {
    let found = false;
    for (let i = 0; i < 300; i++) {
      const s = generatePreflopScenario(true);
      if (s.stackBB < 10 || s.stackBB > 15) continue;
      if (s.effectivePosition !== "BB") continue;
      if (s.facingAction !== "allin") continue;
      found = true;
      expect(s.zone === "yellow" || s.zone === "red").toBe(true);
      expect(resolveCorrectActions(s).length).toBeGreaterThan(0);
      break;
    }
    expect(found).toBe(true);
  });

  it("SB at 10 BB can face BTN shove in generated scenarios", () => {
    let found = false;
    for (let i = 0; i < 300; i++) {
      const s = generatePreflopScenario(true);
      if (s.position !== "SB" || s.playerCount !== "3max") continue;
      if (s.facingAction !== "allin") continue;
      if (s.stackBB > 15) continue;
      found = true;
      const rule = findRangeRule(
        s.effectivePosition,
        s.strategyMode,
        s.actionHistory,
        s.playerCount
      );
      expect(rule?.situationId).toBe("sb_defense_allin");
      break;
    }
    expect(found).toBe(true);
  });
});
