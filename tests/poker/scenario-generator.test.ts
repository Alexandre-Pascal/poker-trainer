import { describe, expect, it } from "vitest";
import { parseHand, isHandInRange } from "@/lib/poker/hand-matcher";
import {
  generatePostflopScenario,
} from "@/lib/poker/scenario-generator";
import {
  getOpenRaiseRange,
  isHeroHandInOpenRaiseRange,
  parsedHandFromHoleCards,
} from "@/lib/poker/ranges";
import { Card } from "@/lib/poker/types";

const HOLE_56O: [Card, Card] = [
  { rank: "5", suit: "h" },
  { rank: "6", suit: "d" },
];

const HOLE_76S: [Card, Card] = [
  { rank: "7", suit: "s" },
  { rank: "6", suit: "s" },
];

describe("scenario-generator postflop preflop range coherence", () => {
  it("rejects 56o from HU SB open raise range", () => {
    expect(
      isHeroHandInOpenRaiseRange(HOLE_56O, "SB", "headsUp", [])
    ).toBe(false);
    expect(isHandInRange(parseHand("56o"), getOpenRaiseRange("SB", "headsUp")!)).toBe(
      false
    );
  });

  it("accepts 76s in HU SB open raise range", () => {
    expect(
      isHeroHandInOpenRaiseRange(HOLE_76S, "SB", "headsUp", [])
    ).toBe(true);
  });

  it("never deals trash hands when hero was preflop aggressor with raise 2 BB", () => {
    const openRange = getOpenRaiseRange("SB", "headsUp")!;

    for (let i = 0; i < 100; i++) {
      const scenario = generatePostflopScenario(20);

      expect(scenario.heroWasPreflopAggressor).toBe(true);
      expect(scenario.street).not.toBe("preflop");
      expect(
        scenario.actionHistory.some(
          (a) => a.actor === "hero" && a.action === "raise_2bb"
        )
      ).toBe(true);

      const hand = parsedHandFromHoleCards(scenario.holeCards);
      expect(isHandInRange(hand, openRange)).toBe(true);
    }
  });

  it("turn scenarios include simulated flop actions in history", () => {
    let foundTurn = false;
    for (let i = 0; i < 200; i++) {
      const scenario = generatePostflopScenario(20);
      if (scenario.street !== "turn") continue;
      foundTurn = true;

      const flopActions = scenario.actionHistory.filter((a) => a.street === "flop");
      expect(flopActions.length).toBeGreaterThanOrEqual(2);
      expect(flopActions.some((a) => a.actor === "hero" && a.action === "check")).toBe(
        true
      );
      expect(
        flopActions.some((a) => a.actor === "villain" && a.action === "check")
      ).toBe(true);
    }
    expect(foundTurn).toBe(true);
  });
});
