import { ActionEvent, Card, ParsedHand, PlayerCount, Position, RangeRule, UserAction } from "../types";
import { handFromCards, isHandInRange } from "../hand-matcher";
import { StrategyMode } from "../stack-zone";
import {
  BB_DEFENSE_VS_ALLIN,
  GREEN_BB_3BET,
  GREEN_BB_CALL,
  GREEN_BB_ISOLATE,
  GREEN_BTN_OPEN,
  GREEN_SB_3BET,
  GREEN_SB_BTN_FOLD,
  GREEN_SB_COMPLETE,
  GREEN_SB_ISOLATE,
  PUSH_BTN,
  PUSH_SB,
  WIDE_PUSH,
} from "./data";

function lastVillainAction(history: ActionEvent[]): ActionEvent | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].actor !== "hero") return history[i];
  }
  return null;
}

function btnFolded(history: ActionEvent[]): boolean {
  return history.some((a) => a.actor === "BTN" && a.action === "fold");
}

function btnRaised(history: ActionEvent[]): boolean {
  return history.some((a) => a.actor === "BTN" && a.action === "raise_2bb");
}

function villainOrBtnRaised(history: ActionEvent[]): boolean {
  return history.some(
    (a) =>
      a.action === "raise_2bb" && (a.actor === "BTN" || a.actor === "villain")
  );
}

function btnLimpped(history: ActionEvent[]): boolean {
  return history.some((a) => a.actor === "BTN" && a.action === "limp");
}

function villainOrBtnLimpped(history: ActionEvent[]): boolean {
  return history.some(
    (a) => a.action === "limp" && (a.actor === "BTN" || a.actor === "villain")
  );
}

function sbLimpped(history: ActionEvent[]): boolean {
  return history.some((a) => a.actor === "SB" && a.action === "limp");
}

function facingAllin(history: ActionEvent[]): boolean {
  return lastVillainAction(history)?.action === "allin";
}

export const RANGE_RULES: RangeRule[] = [
  {
    situationId: "green_btn_open",
    position: "BTN",
    strategyMode: "standard",
    matchActions: (h, pc) =>
      pc === "3max" &&
      h.filter((a) => a.actor !== "hero").length === 0,
    inRangeActions: ["raise_2bb"],
    outOfRangeActions: ["fold"],
    ranges: GREEN_BTN_OPEN,
    ruleRef: "green_btn_open",
    description: "Relancer à 2 BB depuis le bouton en zone verte.",
  },
  {
    situationId: "green_sb_btn_fold",
    position: "SB",
    strategyMode: "standard",
    matchActions: (h) => btnFolded(h) || h.length === 0,
    inRangeActions: ["raise_2bb"],
    outOfRangeActions: ["fold"],
    ranges: GREEN_SB_BTN_FOLD,
    ruleRef: "green_sb_btn_fold",
    description: "Relancer à 2 BB en SB quand le bouton se couche.",
  },
  {
    situationId: "green_sb_vs_raise",
    position: "SB",
    strategyMode: "standard",
    matchActions: (h) => btnRaised(h),
    inRangeActions: ["raise_6bb"],
    outOfRangeActions: ["fold"],
    ranges: GREEN_SB_3BET,
    ruleRef: "green_sb_vs_raise",
    description: "Sur-relancer à 6 BB en SB face à une relance du bouton.",
  },
  {
    situationId: "green_sb_vs_limp",
    position: "SB",
    strategyMode: "standard",
    matchActions: (h) => btnLimpped(h),
    inRangeActions: ["raise_4bb", "call"],
    outOfRangeActions: ["fold"],
    ranges: GREEN_SB_ISOLATE,
    isolateRanges: GREEN_SB_ISOLATE,
    completeRanges: GREEN_SB_COMPLETE,
    ruleRef: "green_sb_vs_limp",
    description: "Isoler à 4 BB ou compléter face à un limp du bouton.",
  },
  {
    situationId: "green_bb_vs_raise",
    position: "BB",
    strategyMode: "standard",
    matchActions: (h) => villainOrBtnRaised(h) && !sbLimpped(h),
    inRangeActions: ["raise_6bb", "call"],
    outOfRangeActions: ["fold"],
    ranges: GREEN_BB_3BET,
    threeBetRanges: GREEN_BB_3BET,
    callRanges: GREEN_BB_CALL,
    ruleRef: "green_bb_vs_raise",
    description: "3-bet à 6 BB ou payer face à une relance (BTN en 3-max, Vilain/BTN en HU).",
  },
  {
    situationId: "green_bb_vs_limp",
    position: "BB",
    strategyMode: "standard",
    matchActions: (h) => villainOrBtnLimpped(h) || sbLimpped(h),
    inRangeActions: ["raise_4bb", "check"],
    outOfRangeActions: [],
    ranges: GREEN_BB_ISOLATE,
    isolateRanges: GREEN_BB_ISOLATE,
    checkRanges: ["*"],
    ruleRef: "green_bb_vs_limp",
    description: "Isoler à 4 BB ou checker gratuitement en BB.",
  },
  {
    situationId: "push_btn",
    position: "BTN",
    strategyMode: "push_fold",
    matchActions: (h, pc) =>
      pc === "3max" && h.filter((a) => a.actor !== "hero").length === 0,
    inRangeActions: ["allin"],
    outOfRangeActions: ["fold"],
    ranges: PUSH_BTN,
    ruleRef: "push_btn",
    description: "Push or Fold depuis le bouton (≤10 BB).",
  },
  {
    situationId: "push_sb",
    position: "SB",
    strategyMode: "push_fold",
    matchActions: (h) => btnFolded(h) || h.length === 0,
    inRangeActions: ["allin"],
    outOfRangeActions: ["fold"],
    ranges: PUSH_SB,
    ruleRef: "push_sb",
    description: "Push or Fold en SB quand le bouton se couche (≤10 BB).",
  },
  {
    situationId: "bb_defense_allin",
    position: "BB",
    strategyMode: "push_fold",
    matchActions: (h) => facingAllin(h),
    inRangeActions: ["call"],
    outOfRangeActions: ["fold"],
    ranges: BB_DEFENSE_VS_ALLIN,
    ruleRef: "bb_defense_allin",
    description: "Défense BB face à un tapis adverse (<10 BB push range).",
  },
  {
    situationId: "wide_push",
    position: "SB",
    strategyMode: "wide_push",
    matchActions: (h) => h.filter((a) => a.actor !== "hero").length === 0,
    inRangeActions: ["allin"],
    outOfRangeActions: ["fold"],
    ranges: WIDE_PUSH,
    ruleRef: "wide_push",
    description: "Push élargi en premier à parler (≤12 BB).",
  },
  {
    situationId: "hu_survival_push",
    position: "SB",
    strategyMode: "hu_survival",
    matchActions: (h) => h.filter((a) => a.actor !== "hero").length === 0,
    inRangeActions: ["allin"],
    outOfRangeActions: ["fold"],
    ranges: ["22+", "A2o+", "A2s+", "K2o+", "K2s+", "Q2o+", "Q2s+", "J2o+", "J2s+", "T2o+", "T2s+", "92o+", "92s+", "82o+", "82s+", "72o+", "72s+"],
    ruleRef: "hu_survival_push",
    description: "Agressivité maximale HU <10 BB — push quasi systématique.",
  },
];

export function findRangeRule(
  effectivePosition: Position,
  strategyMode: StrategyMode,
  history: ActionEvent[],
  playerCount: PlayerCount
): RangeRule | null {
  const candidates = RANGE_RULES.filter(
    (r) =>
      r.position === effectivePosition &&
      r.strategyMode === strategyMode &&
      r.matchActions(history, playerCount)
  );

  if (candidates.length === 0) {
    if (strategyMode === "wide_push") {
      return RANGE_RULES.find((r) => r.situationId === "wide_push") ?? null;
    }
    if (strategyMode === "hu_survival") {
      return RANGE_RULES.find((r) => r.situationId === "hu_survival_push") ?? null;
    }
    return null;
  }

  return candidates[0];
}

/**
 * Range d'ouverture (relance 2 BB) pour le héros agresseur pré-flop.
 * HU BTN → range SB (fusion BTN/SB). 3-max BTN → range BTN open.
 */
export function getOpenRaiseRange(
  effectivePosition: Position,
  playerCount: PlayerCount,
  preflopHistory: ActionEvent[] = []
): string[] | null {
  if (playerCount === "headsUp" && effectivePosition === "SB") {
    return GREEN_SB_BTN_FOLD;
  }
  if (playerCount === "3max" && effectivePosition === "BTN" && preflopHistory.length === 0) {
    return GREEN_BTN_OPEN;
  }
  if (playerCount === "3max" && effectivePosition === "SB" && btnFolded(preflopHistory)) {
    return GREEN_SB_BTN_FOLD;
  }
  return null;
}

export function parsedHandFromHoleCards(hole: [Card, Card]): ParsedHand {
  return handFromCards(
    hole[0].rank,
    hole[1].rank,
    hole[0].suit === hole[1].suit
  );
}

export function isHeroHandInOpenRaiseRange(
  hole: [Card, Card],
  effectivePosition: Position,
  playerCount: PlayerCount,
  preflopHistory: ActionEvent[] = []
): boolean {
  const range = getOpenRaiseRange(effectivePosition, playerCount, preflopHistory);
  if (!range) return false;
  return isHandInRange(parsedHandFromHoleCards(hole), range);
}

export function resolveCorrectPreflopActions(
  hand: ParsedHand,
  rule: RangeRule
): UserAction[] {
  if (rule.situationId === "green_sb_vs_limp") {
    if (isHandInRange(hand, rule.isolateRanges ?? [])) return ["raise_4bb"];
    if (isHandInRange(hand, rule.completeRanges ?? [])) return ["call"];
    return ["fold"];
  }

  if (rule.situationId === "green_bb_vs_raise") {
    if (isHandInRange(hand, rule.threeBetRanges ?? [])) return ["raise_6bb"];
    if (isHandInRange(hand, rule.callRanges ?? [])) return ["call"];
    return ["fold"];
  }

  if (rule.situationId === "green_bb_vs_limp") {
    if (isHandInRange(hand, rule.isolateRanges ?? [])) return ["raise_4bb"];
    return ["check"];
  }

  if (isHandInRange(hand, rule.ranges)) {
    return rule.inRangeActions;
  }

  return rule.outOfRangeActions.length > 0 ? rule.outOfRangeActions : ["fold"];
}
