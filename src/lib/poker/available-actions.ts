import { Scenario, UserAction } from "./types";
import { isPushFoldZone } from "./stack-zone";
import {
  isBbShortStackRejamSpot,
  isBbShortStackShoveOverLimpSpot,
  isSbShortStackPotCommittedSpot,
} from "./pot-committed";

export function getAvailableActions(scenario: Scenario): UserAction[] {
  const { street, facingAction, isFirstToAct, stackBB, callAmountBB } = scenario;

  if (facingAction === "allin") {
    return ["fold", "call"];
  }

  if (isBbShortStackShoveOverLimpSpot(scenario)) {
    return ["check", "allin"];
  }

  if (isBbShortStackRejamSpot(scenario) || isSbShortStackPotCommittedSpot(scenario)) {
    return ["fold", "allin"];
  }

  if (street !== "preflop") {
    return getPostflopActions(scenario);
  }

  if (isPushFoldZone(stackBB) && isFirstToAct) {
    return ["fold", "allin"];
  }

  if (scenario.strategyMode === "wide_push" || scenario.strategyMode === "hu_survival") {
    if (isFirstToAct) return ["fold", "allin"];
  }

  if (isFirstToAct) {
    if (scenario.effectivePosition === "BB") {
      return ["raise_4bb", "check"];
    }
    if (isPushFoldZone(stackBB)) {
      return ["fold", "allin"];
    }
    return ["fold", "raise_2bb"];
  }

  if (facingAction === "raise_2bb") {
    const actions: UserAction[] = ["fold", "call"];
    if (stackBB > callAmountBB + 6) {
      actions.push("raise_6bb");
    } else if (stackBB > callAmountBB) {
      actions.push("allin");
    }
    return actions;
  }

  if (facingAction === "limp") {
    if (scenario.effectivePosition === "BB") {
      return ["raise_4bb", "check"];
    }
    if (scenario.effectivePosition === "SB") {
      return ["fold", "raise_4bb", "call"];
    }
    return ["fold", "raise_4bb"];
  }

  if (facingAction === "raise_4bb") {
    return ["fold", "call", "allin"];
  }

  if (facingAction === "raise_6bb") {
    return ["fold", "call", "allin"];
  }

  return ["fold", "call"];
}

function getPostflopActions(scenario: Scenario): UserAction[] {
  if (scenario.facingAction === "allin") {
    return ["fold", "call"];
  }

  if (scenario.villainChecked || scenario.facingAction === null) {
    return ["check", "bet_third", "bet_half"];
  }

  if (
    scenario.facingAction === "bet" ||
    scenario.facingAction === "bet_third" ||
    scenario.facingAction === "bet_half"
  ) {
    const actions: UserAction[] = ["fold", "call"];
    if (scenario.stackBB > scenario.callAmountBB * 2) {
      actions.push("raise_6bb");
    }
    return actions;
  }

  return ["check", "bet_third", "bet_half"];
}
