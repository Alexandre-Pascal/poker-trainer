import { isHandInRange } from "./hand-matcher";
import { BB_DEFENSE_VS_ALLIN } from "./ranges/data";
import {
  getBbAggressionPushRange,
  PUSH_HU_MAX_PRESSURE,
  PUSH_SB_3MAX,
} from "./ranges/push-fold";
import { ParsedHand, Scenario, UserAction } from "./types";

export function isShortStackZone(stackBB: number): boolean {
  return stackBB <= 15;
}

/** BB en zone courte face à un limp : isoler par tapis ou checker gratuitement. */
export function isBbShortStackShoveOverLimpSpot(scenario: Scenario): boolean {
  if (scenario.street !== "preflop") return false;
  if (!isShortStackZone(scenario.stackBB)) return false;
  return (
    scenario.effectivePosition === "BB" && scenario.facingAction === "limp"
  );
}

/** BB en zone courte face à une mini-relance : re-jam ou fold (pas de call). */
export function isBbShortStackRejamSpot(scenario: Scenario): boolean {
  if (scenario.street !== "preflop") return false;
  if (!isShortStackZone(scenario.stackBB)) return false;
  return (
    scenario.effectivePosition === "BB" &&
    scenario.facingAction === "raise_2bb" &&
    !scenario.isFirstToAct
  );
}

/** SB en zone courte face à open ou limp BTN : re-jam ou fold. */
export function isSbShortStackPotCommittedSpot(scenario: Scenario): boolean {
  if (scenario.street !== "preflop") return false;
  if (!isShortStackZone(scenario.stackBB)) return false;
  if (scenario.effectivePosition !== "SB" || scenario.isFirstToAct) return false;
  return scenario.facingAction === "raise_2bb" || scenario.facingAction === "limp";
}

/** @deprecated Préférer les helpers spécifiques BB/SB ci-dessus. */
export function isPotCommittedPreflopSpot(scenario: Scenario): boolean {
  return isBbShortStackRejamSpot(scenario) || isSbShortStackPotCommittedSpot(scenario);
}

export function getSbPotCommittedPushRange(scenario: Scenario): string[] {
  if (scenario.playerCount === "headsUp") {
    return PUSH_HU_MAX_PRESSURE;
  }
  return PUSH_SB_3MAX;
}

export function resolveBbShoveOverLimpActions(
  hand: ParsedHand,
  scenario: Scenario
): UserAction[] {
  const range = getBbAggressionPushRange(scenario);
  if (isHandInRange(hand, range)) {
    return ["allin"];
  }
  return ["check"];
}

export function resolveBbRejamActions(
  hand: ParsedHand,
  scenario: Scenario
): UserAction[] {
  const range = getBbAggressionPushRange(scenario);
  if (isHandInRange(hand, range)) {
    return ["allin"];
  }
  return ["fold"];
}

export function resolveSbPotCommittedActions(
  hand: ParsedHand,
  scenario: Scenario
): UserAction[] {
  const range = getSbPotCommittedPushRange(scenario);
  if (isHandInRange(hand, range)) {
    return ["allin"];
  }
  return ["fold"];
}

/** Défense BB/SB face à un tapis adverse (call ou fold). */
export function resolveDefenseVsAllinActions(hand: ParsedHand): UserAction[] {
  if (isHandInRange(hand, BB_DEFENSE_VS_ALLIN)) {
    return ["call"];
  }
  return ["fold"];
}
