import { ParsedHand, RANK_VALUES, RANKS, Rank } from "./types";

const RANK_SET = new Set<string>(RANKS);

export function parseHand(notation: string): ParsedHand {
  const trimmed = notation.trim().toUpperCase();
  if (trimmed.length === 2) {
    const r1 = trimmed[0] as Rank;
    const r2 = trimmed[1] as Rank;
    if (!RANK_SET.has(r1) || !RANK_SET.has(r2) || r1 !== r2) {
      throw new Error(`Invalid pair notation: ${notation}`);
    }
    return { high: r1, low: r2, suited: false, isPair: true };
  }

  const suited = trimmed.endsWith("S");
  const offsuit = trimmed.endsWith("O");
  if (!suited && !offsuit) {
    throw new Error(`Hand must end with s or o: ${notation}`);
  }

  const body = trimmed.slice(0, -1);
  if (body.length !== 2) {
    throw new Error(`Invalid hand notation: ${notation}`);
  }

  const r1 = body[0] as Rank;
  const r2 = body[1] as Rank;
  if (!RANK_SET.has(r1) || !RANK_SET.has(r2) || r1 === r2) {
    throw new Error(`Invalid hand notation: ${notation}`);
  }

  const high = RANK_VALUES[r1] >= RANK_VALUES[r2] ? r1 : r2;
  const low = RANK_VALUES[r1] >= RANK_VALUES[r2] ? r2 : r1;
  return { high, low, suited, isPair: false };
}

export function handToNotation(hand: ParsedHand): string {
  if (hand.isPair) return `${hand.high}${hand.low}`;
  const suffix = hand.suited ? "s" : "o";
  return `${hand.high}${hand.low}${suffix}`;
}

export function handFromCards(
  rank1: Rank,
  rank2: Rank,
  suited: boolean
): ParsedHand {
  if (rank1 === rank2) {
    return { high: rank1, low: rank2, suited: false, isPair: true };
  }
  const high = RANK_VALUES[rank1] >= RANK_VALUES[rank2] ? rank1 : rank2;
  const low = RANK_VALUES[rank1] >= RANK_VALUES[rank2] ? rank2 : rank1;
  return { high, low, suited, isPair: false };
}

function ranksBetween(low: Rank, high: Rank): Rank[] {
  const lowVal = RANK_VALUES[low];
  const highVal = RANK_VALUES[high];
  return RANKS.filter((r) => RANK_VALUES[r] >= lowVal && RANK_VALUES[r] <= highVal);
}

function expandPlus(entry: string): string[] {
  const trimmed = entry.trim();
  if (!trimmed.includes("+")) {
    return [trimmed];
  }

  const base = trimmed.slice(0, -1);

  if (base.length === 2 && base[0] === base[1]) {
    const pairRank = base[0] as Rank;
    return RANKS.filter((r) => RANK_VALUES[r] >= RANK_VALUES[pairRank]).map(
      (r) => `${r}${r}`
    );
  }

  if (base.length === 3) {
    const first = base[0] as Rank;
    const second = base[1] as Rank;
    const suited = base[2] === "s";
    const results: string[] = [];
    for (const r of RANKS) {
      if (r === first) continue;
      if (RANK_VALUES[r] < RANK_VALUES[second]) continue;
      const high = RANK_VALUES[first] >= RANK_VALUES[r] ? first : r;
      const low = RANK_VALUES[first] >= RANK_VALUES[r] ? r : first;
      if (high !== first) continue;
      results.push(`${high}${low}${suited ? "s" : "o"}`);
    }
    return results;
  }

  return [trimmed];
}

function expandRange(entry: string): string[] {
  const trimmed = entry.trim();
  if (trimmed.includes("-")) {
    const [start, end] = trimmed.split("-");
    if (start.length === 2 && start[0] === start[1] && end.length === 2 && end[0] === end[1]) {
      return ranksBetween(start[0] as Rank, end[0] as Rank).map((r) => `${r}${r}`);
    }

    if (start.length === 3 && end.length === 3 && start[0] === end[0]) {
      const first = start[0] as Rank;
      const suited = start[2] === "s";
      const lowStart = start[1] as Rank;
      const lowEnd = end[1] as Rank;
      return ranksBetween(lowStart, lowEnd)
        .filter((r) => r !== first)
        .map((r) => `${first}${r}${suited ? "s" : "o"}`);
    }
  }

  if (trimmed.includes("+")) {
    return expandPlus(trimmed);
  }

  return [trimmed];
}

export function expandRangeEntry(entry: string): string[] {
  return expandRange(entry);
}

export function isHandInRange(hand: ParsedHand, rangeEntries: string[]): boolean {
  const notation = handToNotation(hand);
  for (const entry of rangeEntries) {
    const expanded = expandRange(entry);
    if (expanded.some((e) => e.toUpperCase() === notation.toUpperCase())) {
      return true;
    }
  }
  return false;
}

export function notationFromCards(c1: { rank: Rank }, c2: { rank: Rank }): string {
  const suited = "suit" in c1 && "suit" in c2 && (c1 as { suit: string }).suit === (c2 as { suit: string }).suit;
  return handToNotation(handFromCards(c1.rank, c2.rank, suited));
}
