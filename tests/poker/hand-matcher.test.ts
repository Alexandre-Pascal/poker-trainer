import { describe, expect, it } from "vitest";
import {
  expandRangeEntry,
  handToNotation,
  isHandInRange,
  parseHand,
} from "@/lib/poker/hand-matcher";

describe("parseHand", () => {
  it("parses suited hands", () => {
    const h = parseHand("KJs");
    expect(h.high).toBe("K");
    expect(h.low).toBe("J");
    expect(h.suited).toBe(true);
  });

  it("parses offsuit hands", () => {
    const h = parseHand("T8o");
    expect(handToNotation(h)).toBe("T8o");
  });

  it("parses pairs", () => {
    const h = parseHand("88");
    expect(h.isPair).toBe(true);
  });
});

describe("expandRangeEntry", () => {
  it("expands pair plus", () => {
    expect(expandRangeEntry("88+")).toEqual([
      "88", "99", "TT", "JJ", "QQ", "KK", "AA",
    ]);
  });

  it("expands offsuit plus with fixed first card", () => {
    const expanded = expandRangeEntry("T8o+");
    expect(expanded).toContain("T8o");
    expect(expanded).toContain("T9o");
    expect(expanded).not.toContain("TTo");
  });

  it("expands ace offsuit plus", () => {
    const expanded = expandRangeEntry("A2o+");
    expect(expanded).toContain("A2o");
    expect(expanded).toContain("AKo");
    expect(expanded).not.toContain("A2s");
  });

  it("expands pair range", () => {
    const expanded = expandRangeEntry("22-77");
    expect(expanded).toEqual(["22", "33", "44", "55", "66", "77"]);
  });

  it("expands suited ace range", () => {
    const expanded = expandRangeEntry("A2s-A9s");
    expect(expanded).toContain("A2s");
    expect(expanded).toContain("A9s");
    expect(expanded).not.toContain("ATs");
  });
});

describe("isHandInRange", () => {
  it("matches 22+ with low pair", () => {
    expect(isHandInRange(parseHand("22"), ["22+"])).toBe(true);
  });

  it("matches K5o+ with KJo", () => {
    expect(isHandInRange(parseHand("KJo"), ["K5o+"])).toBe(true);
  });

  it("rejects K4o from K5o+", () => {
    expect(isHandInRange(parseHand("K4o"), ["K5o+"])).toBe(false);
  });

  it("matches ATs+ with AQs", () => {
    expect(isHandInRange(parseHand("AQs"), ["ATs+"])).toBe(true);
  });

  it("matches 98o explicit", () => {
    expect(isHandInRange(parseHand("98o"), ["98o"])).toBe(true);
  });

  it("matches 65s connector", () => {
    expect(isHandInRange(parseHand("65s"), ["65s"])).toBe(true);
  });

  it("matches BB call range hand 53s+", () => {
    expect(isHandInRange(parseHand("53s"), ["53s+"])).toBe(true);
    expect(isHandInRange(parseHand("54s"), ["53s+"])).toBe(true);
  });
});
