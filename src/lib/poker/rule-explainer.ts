import { ParsedHand, Scenario, UserAction } from "./types";
import { handToNotation, isHandInRange } from "./hand-matcher";
import { zoneEmoji, zoneLabel } from "./stack-zone";
import { findRangeRule } from "./ranges";
import type { RangeRule } from "./types";
import { PostflopValidation } from "./postflop/postflop-validator";
import { formatPositionLabel } from "./effective-position";

const ACTION_LABELS: Record<UserAction, string> = {
  fold: "Fold",
  call: "Call",
  check: "Check",
  bet_third: "Bet 1/3 pot",
  bet_half: "Bet 1/2 pot",
  allin: "All-in",
  raise_2bb: "Raise 2 BB",
  raise_4bb: "Raise 4 BB",
  raise_6bb: "Raise 6 BB",
};

export function explainPreflop(
  scenario: Scenario,
  hand: ParsedHand,
  correctActions: UserAction[],
  inRange: boolean
): string {
  const pos = formatPositionLabel(scenario.position, scenario.playerCount);
  const handStr = handToNotation(hand);
  const zone = `${zoneEmoji(scenario.zone)} ${zoneLabel(scenario.zone)}`;
  const actions = correctActions.map((a) => ACTION_LABELS[a]).join(" ou ");

  const rule = findRangeRule(
    scenario.effectivePosition,
    scenario.strategyMode,
    scenario.actionHistory,
    scenario.playerCount
  );

  if (scenario.strategyMode === "hu_survival") {
    return `Avec ${scenario.stackBB} BB en ${pos} (${zone}), en Heads-Up survie tu dois être ultra-agressif. Push quasi systématique en premier à parler. Ta main ${handStr} : action correcte → ${actions}.`;
  }

  if (scenario.strategyMode === "wide_push") {
    return `Avec ${scenario.stackBB} BB en ${pos} (${zone}), tu es en zone Push élargi (≤12 BB, premier à parler). ${inRange ? `${handStr} est dans la range de push.` : `${handStr} n'est pas dans la range de push.`} Action correcte → ${actions}.`;
  }

  if (scenario.strategyMode === "push_fold") {
    if (scenario.facingAction === "allin") {
      return `Avec ${scenario.stackBB} BB en ${pos} (${zone}), tu fais face à un tapis. Les adversaires micro-limite poussent très large. ${inRange ? `${handStr} est dans la range de défense.` : `${handStr} n'est pas assez forte pour payer.`} Action correcte → ${actions}.`;
    }
    return `Avec ${scenario.stackBB} BB en ${pos} (${zone}), mode Push or Fold obligatoire. ${inRange ? `${handStr} est dans la range.` : `${handStr} n'est pas dans la range.`} Action correcte → ${actions}.`;
  }

  if (rule?.situationId === "green_bb_vs_raise") {
    return explainBbVsRaise(scenario, hand, correctActions, rule);
  }

  const desc = rule?.description ?? "Jeu standard pré-flop.";
  return `Avec ${scenario.stackBB} BB en ${pos} (${zone}), ${desc} ${inRange ? `${handStr} est dans la range.` : `${handStr} n'est pas dans la range.`} Action correcte → ${actions}.`;
}

function explainBbVsRaise(
  scenario: Scenario,
  hand: ParsedHand,
  correctActions: UserAction[],
  rule: RangeRule
): string {
  const pos = formatPositionLabel(scenario.position, scenario.playerCount);
  const handStr = handToNotation(hand);
  const zone = `${zoneEmoji(scenario.zone)} ${zoneLabel(scenario.zone)}`;
  const actions = correctActions.map((a) => ACTION_LABELS[a]).join(" ou ");

  if (isHandInRange(hand, rule.threeBetRanges ?? [])) {
    return `Avec ${scenario.stackBB} BB en ${pos} (${zone}), face à une relance, ${handStr} est assez forte pour sur-relancer à 6 BB. Action correcte → ${actions}.`;
  }

  if (isHandInRange(hand, rule.callRanges ?? [])) {
    return `Avec ${scenario.stackBB} BB en ${pos} (${zone}), face à une relance, ${handStr} est dans la range de défense (Call). Action correcte → ${actions}.`;
  }

  let rangeHint = "range de Call";
  if (hand.suited && !hand.isPair) {
    rangeHint = "range de Call (84s+ requis)";
  } else if (hand.isPair) {
    rangeHint = "range de Call (22-77 pour les petites paires)";
  }

  return `Avec ${scenario.stackBB} BB en ${pos} (${zone}), face à une relance, ton ${handStr} n'est pas dans la ${rangeHint}. Action correcte → ${actions}.`;
}

export function explainPostflop(
  scenario: Scenario,
  validation: PostflopValidation,
  correctActions: UserAction[]
): string {
  const actions = correctActions.map((a) => ACTION_LABELS[a]).join(" ou ");
  const { outs, equity, potOdds, strength } = validation.details;

  switch (validation.ruleRef) {
    case "postflop_cbet":
      return `Tu as la position, tu étais l'agresseur pré-flop, le board est sec et l'adversaire checke. C-Bet standard (1/3 à 1/2 pot) pour voler ou valoriser. Action correcte → ${actions}.`;
    case "postflop_cbet_giveup":
      return `L'adversaire a montré de la résistance. Sans main faite, abandonne — ne bluffe pas une Calling Station. Action correcte → ${actions}.`;
    case "postflop_value_bet":
      return `Tu as une main forte (${strength}). Mise de valorisation ~50% du pot pour te faire payer. Action correcte → ${actions}.`;
    case "postflop_draw_call":
      return `Tirage avec ${outs} outs → ~${equity}% d'équité (règle des ${scenario.street === "flop" ? "4" : "2"}). Cote du pot : ${potOdds?.toFixed(0)}%. L'équité dépasse le prix → Call profitable. Action correcte → ${actions}.`;
    case "postflop_draw_fold":
      return `Tirage avec ${outs} outs → ~${equity}% d'équité. Cote du pot : ${potOdds?.toFixed(0)}%. Pas assez d'équité pour payer. Action correcte → ${actions}.`;
    case "postflop_air_fold":
      return `Tu n'as qu'une hauteur ou rien (${strength}). L'adversaire montre de la résistance — Check/Fold, pas de bluff contre une Calling Station. Action correcte → ${actions}.`;
    case "postflop_air_check":
      return `Pas de main faite. Checker gratuitement. Action correcte → ${actions}.`;
    case "postflop_marginal_fold":
      return `Top pair kicker faible sur board dangereux (${strength}). Bluff-catcher trop vulnérable — pas de relance ni de mise, abandonne face à la résistance. Action correcte → ${actions}.`;
    case "postflop_marginal_call":
      return `Main marginale (${strength}) — bluff-catcher possible face à une petite mise, mais jamais de Bet/Raise. Action correcte → ${actions}.`;
    case "postflop_value_raise":
      return `Main forte (${strength}) face à une mise — tu peux payer ou relancer pour valoriser. Action correcte → ${actions}.`;
    default:
      return `Situation post-flop (${strength}). Action correcte → ${actions}.`;
  }
}

export function explainWrongAction(
  scenario: Scenario,
  userAction: UserAction,
  correctActions: UserAction[],
  explanation: string
): string {
  const user = ACTION_LABELS[userAction];
  const correct = correctActions.map((a) => ACTION_LABELS[a]).join(" ou ");
  return `Tu as choisi ${user}, mais la bonne réponse est ${correct}.\n\n${explanation}`;
}
