import { ActionEvent, PlayerCount, Position, StackZone } from "./types";
import { resolveEffectivePosition } from "./effective-position";

export function getStackZone(stackBB: number): StackZone {
  if (stackBB > 15) return "green";
  if (stackBB >= 10) return "yellow";
  return "red";
}

export function isPostflopAllowed(stackBB: number): boolean {
  return stackBB > 15;
}

export function isPushFoldZone(stackBB: number): boolean {
  return stackBB <= 10;
}

export function isWidePushSpot(
  stackBB: number,
  position: Position,
  playerCount: PlayerCount,
  isFirstToAct: boolean
): boolean {
  if (!isFirstToAct) return false;
  const effective = resolveEffectivePosition(position, playerCount);
  if (effective !== "BTN" && effective !== "SB") return false;
  return stackBB <= 12;
}

export function isHuSurvivalPush(
  stackBB: number,
  position: Position,
  playerCount: PlayerCount,
  isFirstToAct: boolean
): boolean {
  if (playerCount !== "headsUp" || !isFirstToAct) return false;
  const effective = resolveEffectivePosition(position, playerCount);
  if (effective !== "SB") return false;
  return stackBB < 10;
}

export type StrategyMode = "standard" | "push_fold" | "wide_push" | "hu_survival";

export function resolveStrategyMode(
  stackBB: number,
  position: Position,
  playerCount: PlayerCount,
  isFirstToAct: boolean,
  facingAction: ActionEvent | null
): StrategyMode {
  if (facingAction?.action === "allin") {
    return "push_fold";
  }

  if (isHuSurvivalPush(stackBB, position, playerCount, isFirstToAct)) {
    return "hu_survival";
  }

  if (isPushFoldZone(stackBB) && isFirstToAct) {
    return "push_fold";
  }

  if (isWidePushSpot(stackBB, position, playerCount, isFirstToAct)) {
    return "wide_push";
  }

  if (isPushFoldZone(stackBB)) {
    return "push_fold";
  }

  return "standard";
}

export function zoneLabel(zone: StackZone): string {
  switch (zone) {
    case "green":
      return "Zone verte (>15 BB)";
    case "yellow":
      return "Zone jaune (10-15 BB)";
    case "red":
      return "Zone rouge (<10 BB)";
  }
}

export function zoneEmoji(zone: StackZone): string {
  switch (zone) {
    case "green":
      return "🟢";
    case "yellow":
      return "🟡";
    case "red":
      return "🔴";
  }
}
