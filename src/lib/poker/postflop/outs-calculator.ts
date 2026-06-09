import { Card, Rank, RANK_VALUES } from "../types";

function rankCounts(cards: Card[]): Map<Rank, number> {
  const counts = new Map<Rank, number>();
  for (const c of cards) {
    counts.set(c.rank, (counts.get(c.rank) ?? 0) + 1);
  }
  return counts;
}

function maxBoardRankValue(board: Card[]): number {
  return Math.max(...board.map((c) => RANK_VALUES[c.rank]));
}

function hasFlushDraw(hole: Card[], board: Card[]): boolean {
  const all = [...hole, ...board];
  const suits = new Map<string, number>();
  for (const c of all) {
    suits.set(c.suit, (suits.get(c.suit) ?? 0) + 1);
  }
  for (const count of suits.values()) {
    if (count === 4) return true;
  }
  return false;
}

function holeParticipatesInStraight(
  hole: Card[],
  straightValues: number[]
): boolean {
  const holeValues = hole.map((c) => RANK_VALUES[c.rank]);
  return holeValues.some((v) => straightValues.includes(v));
}

/**
 * Compte les cartes uniques qui complètent une quinte en une seule street,
 * en exigeant que le hero utilise au moins une de ses hole cards.
 */
function countStraightOuts(hole: Card[], board: Card[]): number {
  const present = new Set(
    [...hole, ...board].map((c) => RANK_VALUES[c.rank])
  );

  const completingRanks = new Set<number>();

  for (let high = 5; high <= 14; high++) {
    const straight =
      high === 5
        ? [14, 2, 3, 4, 5] // A-2-3-4-5 wheel
        : [high - 4, high - 3, high - 2, high - 1, high];

    if (!holeParticipatesInStraight(hole, straight)) continue;

    const missing = straight.filter((v) => !present.has(v));
    if (missing.length !== 1) continue;

    completingRanks.add(missing[0]);
  }

  return completingRanks.size;
}

function countPairOuts(hole: [Card, Card], board: Card[]): number {
  const maxBoard = maxBoardRankValue(board);
  const holeRanks = hole.map((c) => c.rank);
  const isPocketPair = holeRanks[0] === holeRanks[1];

  if (isPocketPair) {
    const pairValue = RANK_VALUES[holeRanks[0]];
    const boardHasHigherPair = board.some(
      (c) => RANK_VALUES[c.rank] > pairValue && board.filter((b) => b.rank === c.rank).length >= 2
    );
    if (boardHasHigherPair) return 0;
    // Flop → 2 outs pour toucher un brelan
    return 2;
  }

  let outs = 0;
  for (const rank of holeRanks) {
    const value = RANK_VALUES[rank];
    const onBoard = board.some((c) => c.rank === rank);

    if (onBoard) continue;

    // Seulement les outs de top pair : carte du hero plus haute que le board
    if (value > maxBoard) {
      outs += 3;
    }
  }

  return outs;
}

function countTripsOuts(hole: [Card, Card], board: Card[]): number {
  const holeRanks = hole.map((c) => c.rank);
  const counts = rankCounts([...hole, ...board]);

  for (const rank of holeRanks) {
    if (counts.get(rank) === 3) {
      return 7;
    }
  }
  return 0;
}

export function countOuts(hole: [Card, Card], board: Card[]): number {
  if (board.length === 0) return 0;

  let outs = 0;

  outs += countPairOuts(hole, board);
  outs += countTripsOuts(hole, board);

  const flushDraw = hasFlushDraw(hole, board);
  const straightOuts = countStraightOuts(hole, board);

  if (flushDraw && straightOuts > 0) {
    // Combo draw : retirer le double comptage (règle 9 + 8 - 2 ≈ 15)
    outs += 15;
  } else {
    if (flushDraw) outs += 9;
    outs += straightOuts;
  }

  return Math.min(outs, 20);
}

export function equityFromOuts(outs: number, street: "flop" | "turn"): number {
  if (outs <= 0) return 0;
  const multiplier = street === "flop" ? 4 : 2;
  return Math.min(outs * multiplier, 100);
}
