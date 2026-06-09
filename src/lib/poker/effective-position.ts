import { PlayerCount, Position } from "./types";

export function resolveEffectivePosition(
  position: Position,
  playerCount: PlayerCount
): Position {
  if (playerCount === "headsUp" && position === "BTN") {
    return "SB";
  }
  return position;
}

export function formatPositionLabel(
  position: Position,
  playerCount: PlayerCount
): string {
  if (playerCount === "headsUp" && position === "BTN") {
    return "BTN (SB)";
  }
  return position;
}
