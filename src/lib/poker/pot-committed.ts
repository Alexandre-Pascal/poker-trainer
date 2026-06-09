import { isHandInRange } from "./hand-matcher";
import { BB_DEFENSE_VS_ALLIN } from "./ranges/data";
import { ParsedHand, Scenario, UserAction } from "./types";

export function isShortStackZone(stackBB: number): boolean {
  return stackBB <= 15;
}

/**
 * Micro-tapis + mini-relance ou limp adverse = adversaire pot-committed.
 * Hero doit réagir comme face à un tapis (All-in ou Fold, jamais Call).
 */
export function isPotCommittedPreflopSpot(scenario: Scenario): boolean {
  if (scenario.street !== "preflop") return false;
  if (!isShortStackZone(scenario.stackBB)) return false;

  if (scenario.facingAction === "raise_2bb" && !scenario.isFirstToAct) {
    return true;
  }

  if (scenario.facingAction === "limp") {
    const pos = scenario.effectivePosition;
    return pos === "BB" || pos === "SB";
  }

  return false;
}

export function resolvePotCommittedCorrectActions(hand: ParsedHand): UserAction[] {
  if (isHandInRange(hand, BB_DEFENSE_VS_ALLIN)) {
    return ["allin"];
  }
  return ["fold"];
}
