import { Card, RANK_VALUES } from "../types";
import { countOuts } from "./outs-calculator";

export type HandStrength =
  | "monster"
  | "strong"
  | "marginal"
  | "draw"
  | "weak"
  | "air";

const WEAK_KICKER_THRESHOLD = RANK_VALUES.T;

export function isDryBoard(board: Card[]): boolean {
  if (board.length < 3) return false;
  return !isDangerousBoard(board);
}

/** Board coordonné (connecté) ou menace couleur (3+ cartes même couleur). */
export function isDangerousBoard(board: Card[]): boolean {
  const suitCounts = new Map<string, number>();
  for (const c of board) {
    suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  }
  if ([...suitCounts.values()].some((n) => n >= 3)) return true;

  const values = [...new Set(board.map((c) => RANK_VALUES[c.rank]))].sort(
    (a, b) => a - b
  );

  for (let i = 0; i < values.length - 1; i++) {
    if (values[i + 1] - values[i] <= 2) return true;
  }

  return false;
}

function getTopPairKickerValue(
  hole: [Card, Card],
  board: Card[]
): number | null {
  const maxBoardRank = Math.max(...board.map((c) => RANK_VALUES[c.rank]));
  const holeMatchingTop = hole.filter(
    (c) => c.rank !== undefined && board.some((b) => b.rank === c.rank) && RANK_VALUES[c.rank] === maxBoardRank
  );

  if (holeMatchingTop.length === 0) return null;

  if (hole[0].rank === hole[1].rank) {
    return RANK_VALUES[hole[0].rank];
  }

  const kickerCard = hole.find((c) => RANK_VALUES[c.rank] !== maxBoardRank);
  return kickerCard ? RANK_VALUES[kickerCard.rank] : null;
}

export function isTopPairWeakKicker(
  hole: [Card, Card],
  board: Card[]
): boolean {
  const kickerValue = getTopPairKickerValue(hole, board);
  if (kickerValue === null) return false;
  return kickerValue < WEAK_KICKER_THRESHOLD;
}

export function hasTopPair(hole: [Card, Card], board: Card[]): boolean {
  return getTopPairKickerValue(hole, board) !== null;
}

export type BoardPairType = "top" | "middle" | "bottom" | null;

/** Type de paire formée entre une hole card et le board (hors brelans+). */
export function getBoardPairType(
  hole: [Card, Card],
  board: Card[]
): BoardPairType {
  if (board.length === 0) return null;

  const boardRankValues = [
    ...new Set(board.map((c) => RANK_VALUES[c.rank])),
  ].sort((a, b) => b - a);

  const pairedHoleRanks = hole
    .filter((c) => board.some((b) => b.rank === c.rank))
    .map((c) => RANK_VALUES[c.rank]);

  if (pairedHoleRanks.length === 0) return null;

  const pairValue = Math.max(...pairedHoleRanks);
  const highest = boardRankValues[0];
  const lowest = boardRankValues[boardRankValues.length - 1];

  if (pairValue === highest) return "top";
  if (pairValue === lowest) return "bottom";
  return "middle";
}

export function hasBoardPair(hole: [Card, Card], board: Card[]): boolean {
  return getBoardPairType(hole, board) !== null;
}

function hasMadeHand(hole: [Card, Card], board: Card[]): boolean {
  const all = [...hole, ...board];
  const rankCounts = new Map<string, number>();
  const suitCounts = new Map<string, number>();

  for (const c of all) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) ?? 0) + 1);
    suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  }

  const maxRankCount = Math.max(...rankCounts.values());
  const maxSuitCount = Math.max(...suitCounts.values());

  if (maxSuitCount >= 5 || maxRankCount >= 4) return true;
  if (maxRankCount === 3) return true;
  if (hasTopPair(hole, board)) return true;
  if (hasBoardPair(hole, board)) return true;

  const holeRanks = hole.map((c) => c.rank);
  const hasTwoPair =
    maxRankCount === 2 &&
    holeRanks.filter((r) => board.some((c) => c.rank === r)).length >= 1 &&
    board.some(
      (c) =>
        board.filter((b) => b.rank === c.rank).length >= 2 &&
        !holeRanks.includes(c.rank)
    );
  return hasTwoPair;
}

export function evaluateHandStrength(
  hole: [Card, Card],
  board: Card[]
): HandStrength {
  if (board.length === 0) return "air";

  const all = [...hole, ...board];
  const rankCounts = new Map<string, number>();
  const suitCounts = new Map<string, number>();

  for (const c of all) {
    rankCounts.set(c.rank, (rankCounts.get(c.rank) ?? 0) + 1);
    suitCounts.set(c.suit, (suitCounts.get(c.suit) ?? 0) + 1);
  }

  const maxRankCount = Math.max(...rankCounts.values());
  const maxSuitCount = Math.max(...suitCounts.values());

  if (maxSuitCount >= 5) return "monster";
  if (maxRankCount >= 4) return "monster";
  if (maxRankCount === 3) return "strong";

  const topPair = hasTopPair(hole, board);

  if (topPair && maxRankCount === 2) {
    const weakKicker = isTopPairWeakKicker(hole, board);
    const dangerous = isDangerousBoard(board);

    if (weakKicker && dangerous) return "marginal";
    if (weakKicker) return "weak";
    if (dangerous) return "marginal";
    return "strong";
  }

  const pairType = getBoardPairType(hole, board);
  if (pairType === "middle" || pairType === "bottom") {
    return "marginal";
  }

  const outs = countOuts(hole, board);
  if (outs >= 8) return "draw";
  if (outs >= 4) return "draw";

  const hasAce = hole.some((c) => c.rank === "A");
  const boardHasAce = board.some((c) => c.rank === "A");
  if (hasAce && !boardHasAce && !hasMadeHand(hole, board)) return "weak";

  return "air";
}
