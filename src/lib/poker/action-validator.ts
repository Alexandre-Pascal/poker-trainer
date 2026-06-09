import { handFromCards, isHandInRange } from "./hand-matcher";
import { Scenario, UserAction, ValidationResult } from "./types";
import {
  findRangeRule,
  resolveCorrectPreflopActions,
} from "./ranges";
import {
  getSbBtnPushFoldRange,
  isHuMaxPressurePushSpot,
} from "./ranges/push-fold";
import {
  isFacingVillainBet,
  sanitizeActionsForFacingBet,
  validatePostflopAction,
} from "./postflop/postflop-validator";
import {
  explainPostflop,
  explainBbRejam,
  explainBbShoveOverLimp,
  explainPotCommitted,
  explainHuMaxPressurePush,
  explainPreflop,
  explainWrongAction,
} from "./rule-explainer";
import {
  isBbShortStackRejamSpot,
  isBbShortStackShoveOverLimpSpot,
  isSbShortStackPotCommittedSpot,
  resolveBbRejamActions,
  resolveBbShoveOverLimpActions,
  resolveSbPotCommittedActions,
} from "./pot-committed";

function actionsMatch(user: UserAction, correct: UserAction[]): boolean {
  if (correct.includes(user)) return true;
  if (
    (user === "bet_third" || user === "bet_half") &&
    correct.some((a) => a === "bet_third" || a === "bet_half")
  ) {
    return true;
  }
  return false;
}

export function validateAction(
  scenario: Scenario,
  userAction: UserAction
): ValidationResult {
  if (scenario.street !== "preflop") {
    const postflop = validatePostflopAction(scenario);
    const correctActions = sanitizeActionsForFacingBet(
      postflop.correctActions,
      isFacingVillainBet(scenario)
    );
    const explanation = explainPostflop(scenario, postflop, correctActions);
    const isCorrect = actionsMatch(userAction, correctActions);

    return {
      isCorrect,
      correctActions,
      explanation: isCorrect
        ? explanation
        : explainWrongAction(scenario, userAction, correctActions, explanation),
      ruleRef: postflop.ruleRef,
    };
  }

  const hand = handFromCards(
    scenario.holeCards[0].rank,
    scenario.holeCards[1].rank,
    scenario.holeCards[0].suit === scenario.holeCards[1].suit
  );

  if (isBbShortStackShoveOverLimpSpot(scenario)) {
    const correctActions = resolveBbShoveOverLimpActions(hand, scenario);
    const inRange = correctActions.includes("allin");
    const explanation = explainBbShoveOverLimp(scenario, hand, inRange);
    const isCorrect = actionsMatch(userAction, correctActions);

    return {
      isCorrect,
      correctActions,
      explanation: isCorrect
        ? explanation
        : explainWrongAction(scenario, userAction, correctActions, explanation),
      ruleRef: "bb_shove_vs_limp_short",
    };
  }

  if (isBbShortStackRejamSpot(scenario)) {
    const correctActions = resolveBbRejamActions(hand, scenario);
    const inRange = correctActions.includes("allin");
    const explanation = explainBbRejam(scenario, hand, inRange);
    const isCorrect = actionsMatch(userAction, correctActions);

    return {
      isCorrect,
      correctActions,
      explanation: isCorrect
        ? explanation
        : explainWrongAction(scenario, userAction, correctActions, explanation),
      ruleRef: "bb_rejam_short",
    };
  }

  if (isSbShortStackPotCommittedSpot(scenario)) {
    const correctActions = resolveSbPotCommittedActions(hand, scenario);
    const inRange = correctActions.includes("allin");
    const explanation = explainPotCommitted(scenario, hand, inRange);
    const isCorrect = actionsMatch(userAction, correctActions);

    return {
      isCorrect,
      correctActions,
      explanation: isCorrect
        ? explanation
        : explainWrongAction(scenario, userAction, correctActions, explanation),
      ruleRef: "sb_pot_committed",
    };
  }

  if (isHuMaxPressurePushSpot(scenario)) {
    const range = getSbBtnPushFoldRange(scenario)!;
    const inRange = isHandInRange(hand, range);
    const correctActions: UserAction[] = inRange ? ["allin"] : ["fold"];
    const explanation = explainHuMaxPressurePush(hand, inRange);
    const isCorrect = actionsMatch(userAction, correctActions);

    return {
      isCorrect,
      correctActions,
      explanation: isCorrect
        ? explanation
        : explainWrongAction(scenario, userAction, correctActions, explanation),
      ruleRef: "push_hu_max_pressure",
    };
  }

  const rule = findRangeRule(
    scenario.effectivePosition,
    scenario.strategyMode,
    scenario.actionHistory,
    scenario.playerCount
  );

  if (!rule) {
    const ctx = `${scenario.effectivePosition} / ${scenario.playerCount} / facing ${scenario.facingAction ?? "rien"}`;
    return {
      isCorrect: userAction === "fold",
      correctActions: ["fold"],
      explanation: `Situation pré-flop non reconnue (${ctx}). Vérifie l'historique des actions — en l'absence de règle, Fold.`,
      ruleRef: "unknown",
    };
  }

  const correctActions = resolveCorrectPreflopActions(hand, rule);
  const inRange =
    rule.situationId === "green_bb_vs_limp"
      ? isHandInRange(hand, rule.isolateRanges ?? [])
      : rule.situationId === "green_bb_vs_raise"
        ? isHandInRange(hand, rule.threeBetRanges ?? []) ||
          isHandInRange(hand, rule.callRanges ?? [])
        : rule.situationId === "green_sb_vs_limp"
          ? isHandInRange(hand, rule.isolateRanges ?? []) ||
            isHandInRange(hand, rule.completeRanges ?? [])
          : isHandInRange(hand, rule.ranges);

  const explanation = explainPreflop(scenario, hand, correctActions, inRange);
  const isCorrect = actionsMatch(userAction, correctActions);

  return {
    isCorrect,
    correctActions,
    explanation: isCorrect
      ? explanation
      : explainWrongAction(scenario, userAction, correctActions, explanation),
    ruleRef: rule.ruleRef,
  };
}

export function resolveCorrectActions(scenario: Scenario): UserAction[] {
  if (scenario.street !== "preflop") {
    const result = validatePostflopAction(scenario);
    return sanitizeActionsForFacingBet(
      result.correctActions,
      isFacingVillainBet(scenario)
    );
  }

  const hand = handFromCards(
    scenario.holeCards[0].rank,
    scenario.holeCards[1].rank,
    scenario.holeCards[0].suit === scenario.holeCards[1].suit
  );

  if (isBbShortStackShoveOverLimpSpot(scenario)) {
    return resolveBbShoveOverLimpActions(hand, scenario);
  }

  if (isBbShortStackRejamSpot(scenario)) {
    return resolveBbRejamActions(hand, scenario);
  }

  if (isSbShortStackPotCommittedSpot(scenario)) {
    return resolveSbPotCommittedActions(hand, scenario);
  }

  if (isHuMaxPressurePushSpot(scenario)) {
    const range = getSbBtnPushFoldRange(scenario)!;
    return isHandInRange(hand, range) ? ["allin"] : ["fold"];
  }

  const rule = findRangeRule(
    scenario.effectivePosition,
    scenario.strategyMode,
    scenario.actionHistory,
    scenario.playerCount
  );

  if (!rule) return ["fold"];
  return resolveCorrectPreflopActions(hand, rule);
}
