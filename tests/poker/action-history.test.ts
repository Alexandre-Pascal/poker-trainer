import { describe, expect, it } from "vitest";
import {
  formatActionHistoryByStreet,
  groupActionHistoryByStreet,
} from "@/lib/poker/action-history";
import { buildPostflopActionHistory } from "@/lib/poker/scenario-generator";

describe("action-history", () => {
  it("groups turn scenario with flop checks", () => {
    const history = [
      { actor: "hero" as const, action: "raise_2bb" as const, amountBB: 2, street: "preflop" as const },
      { actor: "villain" as const, action: "call" as const, street: "preflop" as const },
      { actor: "hero" as const, action: "check" as const, street: "flop" as const },
      { actor: "villain" as const, action: "check" as const, street: "flop" as const },
      { actor: "villain" as const, action: "bet_half" as const, amountBB: 1.5, street: "turn" as const },
    ];

    const groups = groupActionHistoryByStreet(history, "turn");
    expect(groups).toHaveLength(3);
    expect(groups[0].street).toBe("preflop");
    expect(groups[1].street).toBe("flop");
    expect(groups[2].street).toBe("turn");
    expect(groups[2].isCurrent).toBe(true);
    expect(groups[0].isCurrent).toBe(false);

    const formatted = formatActionHistoryByStreet(history, "turn");
    expect(formatted).toContain("Pré-flop : Hero relance 2 BB, Vilain call");
    expect(formatted).toContain("Flop : Hero check, Vilain check");
    expect(formatted).toContain("Turn : Vilain mise 1/2");
  });

  it("buildPostflopActionHistory adds flop checks on turn", () => {
    const history = buildPostflopActionHistory("turn", false, 1.5);
    const flopActions = history.filter((a) => a.street === "flop");
    expect(flopActions).toEqual([
      { actor: "hero", action: "check", street: "flop" },
      { actor: "villain", action: "check", street: "flop" },
    ]);
    const turnActions = history.filter((a) => a.street === "turn");
    expect(turnActions).toHaveLength(1);
    expect(turnActions[0].action).toBe("bet_half");
  });

  it("buildPostflopActionHistory flop street has no flop phase", () => {
    const history = buildPostflopActionHistory("flop", true, 0);
    expect(history.filter((a) => a.street === "flop")).toHaveLength(1);
    expect(history.filter((a) => a.street === "turn")).toHaveLength(0);
  });
});
