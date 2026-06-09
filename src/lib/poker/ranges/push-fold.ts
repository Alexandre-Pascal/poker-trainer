import { ActionEvent, PlayerCount, Scenario } from "../types";
import { StrategyMode } from "../stack-zone";

/** Catégorie A — 3-Max SB quand le BTN a fold (≤ 12 BB). */
export const PUSH_SB_3MAX = [
  "22+",
  "A2o+",
  "A2s+",
  "K2o+",
  "K2s+",
  "Q2o+",
  "Q2s+",
  "J8o+",
  "J2s+",
  "T8o+",
  "T7s+",
];

/**
 * BB en zone courte qui isole par tapis (vs limp) ou re-jam (vs mini-relance).
 * Même largeur que le push SB 3-Max — voler / punir les limps en tapis court.
 */
export const BB_PUSH_SHORT_3MAX = PUSH_SB_3MAX;

/** Catégorie B — Heads-Up BTN/SB, pression maximale top 80 % (≤ 12 BB). */
export const PUSH_HU_MAX_PRESSURE = [
  "22+",
  "A2o+",
  "A2s+",
  "K2o+",
  "K2s+",
  "Q2o+",
  "Q2s+",
  "J5o+",
  "J2s+",
  "T7o+",
  "T4s+",
  "97o+",
  "95s+",
  "85s+",
  "74s+",
  "64s+",
  "54s",
];

const PUSH_MODES: StrategyMode[] = ["push_fold", "wide_push", "hu_survival"];

function btnFolded(history: ActionEvent[]): boolean {
  return history.some((a) => a.actor === "BTN" && a.action === "fold");
}

export function isHuMaxPressurePushSpot(scenario: Scenario): boolean {
  return (
    scenario.playerCount === "headsUp" &&
    getSbBtnPushFoldRange(scenario) !== null
  );
}

/**
 * Range Push/Fold SB/BTN en zone rouge/jaune (≤ 12 BB), ou null si hors scope.
 */
export function getSbBtnPushFoldRange(
  scenario: Pick<
    Scenario,
    | "playerCount"
    | "effectivePosition"
    | "isFirstToAct"
    | "stackBB"
    | "street"
    | "strategyMode"
    | "actionHistory"
  >
): string[] | null {
  if (scenario.street !== "preflop" || !scenario.isFirstToAct) return null;
  if (scenario.stackBB > 12) return null;
  if (scenario.effectivePosition !== "SB") return null;
  if (!PUSH_MODES.includes(scenario.strategyMode)) return null;

  if (scenario.playerCount === "headsUp") {
    return PUSH_HU_MAX_PRESSURE;
  }

  if (scenario.playerCount === "3max" && btnFolded(scenario.actionHistory)) {
    return PUSH_SB_3MAX;
  }

  return null;
}

/** Range de tapis agressif pour la BB en zone courte (iso-shove / re-jam). */
export function getBbAggressionPushRange(
  scenario: Pick<Scenario, "playerCount">
): string[] {
  if (scenario.playerCount === "headsUp") {
    return PUSH_HU_MAX_PRESSURE;
  }
  return BB_PUSH_SHORT_3MAX;
}
