import { Scenario, UserAction } from "../types";
import { countOuts, equityFromOuts } from "./outs-calculator";
import { isProfitableCall, potOddsPercent } from "./pot-odds";
import { evaluateHandStrength, isDryBoard } from "./board-analyzer";

export interface PostflopValidation {
  correctActions: UserAction[];
  ruleRef: string;
  details: {
    outs?: number;
    equity?: number;
    potOdds?: number;
    strength?: string;
  };
}

const BET_ACTIONS: UserAction[] = ["bet_third", "bet_half"];

export function isFacingVillainBet(scenario: Scenario): boolean {
  return (
    scenario.facingAction !== null &&
    scenario.facingAction !== "check" &&
    scenario.facingAction !== "allin" &&
    scenario.callAmountBB > 0
  );
}

export function isStandardVillainBet(scenario: Scenario): boolean {
  return (
    scenario.facingAction === "bet" ||
    scenario.facingAction === "bet_third" ||
    scenario.facingAction === "bet_half"
  );
}

/** Face à une mise adverse : jamais de bet en réponse. */
export function sanitizeActionsForFacingBet(
  actions: UserAction[],
  facingBet: boolean
): UserAction[] {
  if (!facingBet) return actions;
  return actions.filter((a) => !BET_ACTIONS.includes(a));
}

/** Air ou hauteur faible sans paire faite — pas un bluff-catcher. */
function isAirOrWeakHand(
  strength: ReturnType<typeof evaluateHandStrength>
): boolean {
  return strength === "air" || strength === "weak";
}

export function validatePostflopAction(scenario: Scenario): PostflopValidation {
  const hole = scenario.holeCards;
  const board = scenario.board;
  const street = scenario.street === "turn" ? "turn" : "flop";
  const strength = evaluateHandStrength(hole, board);
  const outs = countOuts(hole, board);
  const equity = equityFromOuts(outs, street);
  const potOdds = potOddsPercent(scenario.callAmountBB, scenario.potBB);
  const facingBet = isFacingVillainBet(scenario);
  const standardBet = isStandardVillainBet(scenario);

  const details = { outs, equity, potOdds, strength };

  const finish = (
    actions: UserAction[],
    ruleRef: string
  ): PostflopValidation => ({
    correctActions: sanitizeActionsForFacingBet(actions, facingBet),
    ruleRef,
    details,
  });

  // Air / weak (rien, hauteur As) face à une mise → Fold
  if (isAirOrWeakHand(strength) && facingBet) {
    return finish(["fold"], "postflop_air_fold");
  }

  if (scenario.facingAction === "allin") {
    if (
      strength === "monster" ||
      strength === "strong" ||
      strength === "marginal" ||
      (outs >= 8 && equity > potOdds)
    ) {
      return finish(["call"], "postflop_call_allin");
    }
    return finish(["fold"], "postflop_fold_allin");
  }

  // Marginal (top paire bluff-catcher, 2e paire) face à mise standard → Call
  if (facingBet && strength === "marginal" && standardBet) {
    return finish(["call"], "postflop_marginal_call");
  }

  if (scenario.postflopType === "cbet") {
    if (scenario.villainChecked) {
      return finish(["bet_third", "bet_half"], "postflop_cbet");
    }
    return finish(["fold"], "postflop_cbet_giveup");
  }

  if (scenario.postflopType === "value") {
    if (facingBet) {
      if (strength === "monster" || strength === "strong") {
        return finish(["call", "raise_6bb"], "postflop_value_raise");
      }
      if (strength === "marginal") {
        return finish(["call"], "postflop_marginal_call");
      }
      return finish(["fold"], "postflop_air_fold");
    }
    return finish(["bet_half"], "postflop_value_bet");
  }

  if (scenario.postflopType === "draw" && outs >= 4) {
    if (facingBet) {
      if (isProfitableCall(equity, scenario.callAmountBB, scenario.potBB)) {
        return finish(["call"], "postflop_draw_call");
      }
      return finish(["fold"], "postflop_draw_fold");
    }
    return finish(["check"], "postflop_draw_check");
  }

  if (isAirOrWeakHand(strength)) {
    if (facingBet) {
      return finish(["fold"], "postflop_air_fold");
    }
    return finish(["check"], "postflop_air_check");
  }

  if (
    !facingBet &&
    scenario.heroWasPreflopAggressor &&
    scenario.isHeadsUpPostflop &&
    scenario.villainChecked &&
    isDryBoard(board) &&
    (strength === "draw" || strength === "strong" || strength === "monster")
  ) {
    return finish(["bet_third", "bet_half"], "postflop_cbet");
  }

  if ((strength === "monster" || strength === "strong") && !facingBet) {
    return finish(["bet_half"], "postflop_value_bet");
  }

  if (facingBet && (strength === "monster" || strength === "strong")) {
    return finish(["call", "raise_6bb"], "postflop_value_raise");
  }

  if (facingBet && strength === "marginal") {
    return finish(["call"], "postflop_marginal_call");
  }

  if (outs >= 4 && facingBet) {
    if (isProfitableCall(equity, scenario.callAmountBB, scenario.potBB)) {
      return finish(["call"], "postflop_draw_call");
    }
    return finish(["fold"], "postflop_draw_fold");
  }

  if (facingBet) {
    return finish(["fold"], "postflop_air_fold");
  }

  return finish(["check"], "postflop_default");
}
