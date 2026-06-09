import { describe, expect, it } from "vitest";
import { isProfitableCall, potOddsPercent } from "@/lib/poker/postflop/pot-odds";

describe("pot-odds", () => {
  it("calculates pot odds", () => {
    expect(potOddsPercent(1, 3)).toBeCloseTo(25, 0);
  });

  it("profitable call when equity exceeds pot odds", () => {
    expect(isProfitableCall(36, 1, 3)).toBe(true);
    expect(isProfitableCall(20, 1, 3)).toBe(false);
  });
});
