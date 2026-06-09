import { describe, expect, it } from "vitest";
import {
  formatPositionLabel,
  resolveEffectivePosition,
} from "@/lib/poker/effective-position";

describe("effective-position", () => {
  it("maps BTN to SB in heads-up", () => {
    expect(resolveEffectivePosition("BTN", "headsUp")).toBe("SB");
  });

  it("keeps BB in heads-up", () => {
    expect(resolveEffectivePosition("BB", "headsUp")).toBe("BB");
  });

  it("keeps BTN in 3-max", () => {
    expect(resolveEffectivePosition("BTN", "3max")).toBe("BTN");
  });

  it("formats HU BTN label", () => {
    expect(formatPositionLabel("BTN", "headsUp")).toBe("BTN (SB)");
  });
});
