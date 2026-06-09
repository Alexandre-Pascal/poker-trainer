import { describe, expect, it } from "vitest";
import { countOuts, equityFromOuts } from "@/lib/poker/postflop/outs-calculator";

describe("outs-calculator", () => {
  it("counts flush draw outs", () => {
    const outs = countOuts(
      [
        { rank: "A", suit: "h" },
        { rank: "K", suit: "h" },
      ],
      [
        { rank: "2", suit: "h" },
        { rank: "7", suit: "d" },
        { rank: "T", suit: "h" },
      ]
    );
    expect(outs).toBeGreaterThanOrEqual(9);
  });

  it("equity rule of 4 on flop", () => {
    expect(equityFromOuts(9, "flop")).toBe(36);
  });

  it("equity rule of 2 on turn", () => {
    expect(equityFromOuts(9, "turn")).toBe(18);
  });
});
