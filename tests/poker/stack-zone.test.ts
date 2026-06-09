import { describe, expect, it } from "vitest";
import {
  getStackZone,
  isPostflopAllowed,
  isPushFoldZone,
  isWidePushSpot,
  isHuSurvivalPush,
  resolveStrategyMode,
} from "@/lib/poker/stack-zone";

describe("stack-zone", () => {
  it("classifies zones", () => {
    expect(getStackZone(20)).toBe("green");
    expect(getStackZone(12)).toBe("yellow");
    expect(getStackZone(8)).toBe("red");
  });

  it("postflop only above 15 BB", () => {
    expect(isPostflopAllowed(16)).toBe(true);
    expect(isPostflopAllowed(15)).toBe(false);
  });

  it("push fold at 10 BB and below", () => {
    expect(isPushFoldZone(10)).toBe(true);
    expect(isPushFoldZone(11)).toBe(false);
  });

  it("wide push at 12 BB BTN first to act", () => {
    expect(isWidePushSpot(12, "BTN", "3max", true)).toBe(true);
    expect(isWidePushSpot(12, "BB", "3max", true)).toBe(false);
  });

  it("HU survival push under 10 BB", () => {
    expect(isHuSurvivalPush(9, "BTN", "headsUp", true)).toBe(true);
    expect(isHuSurvivalPush(11, "BTN", "headsUp", true)).toBe(false);
  });

  it("resolveStrategyMode prioritizes hu survival", () => {
    expect(
      resolveStrategyMode(9, "BTN", "headsUp", true, null)
    ).toBe("hu_survival");
  });

  it("resolveStrategyMode push fold at 8 BB", () => {
    expect(
      resolveStrategyMode(8, "BTN", "3max", true, null)
    ).toBe("push_fold");
  });
});
