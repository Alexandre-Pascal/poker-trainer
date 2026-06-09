import { expandRangeEntry } from "../hand-matcher";
import { RANKS } from "../types";

/** A en haut à gauche, 2 en bas à droite — format standard des charts. */
export const MATRIX_RANKS = [...RANKS].reverse() as (typeof RANKS)[number][];

export const TOTAL_PREFLOP_COMBOS = 169;

export function matrixCellNotation(
  row: number,
  col: number
): string {
  const r1 = MATRIX_RANKS[row];
  const r2 = MATRIX_RANKS[col];
  if (row === col) return `${r1}${r2}`;
  if (row < col) return `${r1}${r2}s`;
  return `${r2}${r1}o`;
}

export function expandRangeToHandSet(entries: string[]): Set<string> {
  const set = new Set<string>();
  for (const entry of entries) {
    for (const hand of expandRangeEntry(entry)) {
      set.add(hand.toUpperCase());
    }
  }
  return set;
}

export function countHandsInRange(entries: string[]): number {
  return expandRangeToHandSet(entries).size;
}

export function rangePercentage(entries: string[]): number {
  return Math.round((countHandsInRange(entries) / TOTAL_PREFLOP_COMBOS) * 1000) / 10;
}

export type MatrixLayer = {
  id: string;
  label: string;
  entries: string[];
  activeClass: string;
};

export type GroupedRangeEntries = {
  pairs: string[];
  suited: string[];
  offsuit: string[];
};

export function groupRangeEntries(entries: string[]): GroupedRangeEntries {
  const pairs: string[] = [];
  const suited: string[] = [];
  const offsuit: string[] = [];

  for (const entry of entries) {
    const trimmed = entry.trim();
    if (
      trimmed.length >= 2 &&
      trimmed[0] === trimmed[1] &&
      (trimmed.length === 2 || trimmed.endsWith("+"))
    ) {
      pairs.push(trimmed);
      continue;
    }
    if (trimmed.endsWith("s+") || trimmed.endsWith("s")) {
      suited.push(trimmed);
      continue;
    }
    if (trimmed.endsWith("o+") || trimmed.endsWith("o")) {
      offsuit.push(trimmed);
    }
  }

  return { pairs, suited, offsuit };
}

export function countRangeByType(entries: string[]): {
  pairs: number;
  suited: number;
  offsuit: number;
} {
  const hands = expandRangeToHandSet(entries);
  let pairs = 0;
  let suited = 0;
  let offsuit = 0;

  for (const hand of hands) {
    if (hand.length === 2) pairs++;
    else if (hand.endsWith("S")) suited++;
    else if (hand.endsWith("O")) offsuit++;
  }

  return { pairs, suited, offsuit };
}
