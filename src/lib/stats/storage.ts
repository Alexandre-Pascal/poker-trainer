import { Position, StackZone, Street } from "../poker/types";

export interface TrainerStats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
  byZone: Record<StackZone, { total: number; correct: number }>;
  byStreet: Record<Street, { total: number; correct: number }>;
  byPosition: Record<Position, { total: number; correct: number }>;
  history: Array<{
    correct: boolean;
    zone: StackZone;
    street: Street;
    position: Position;
    timestamp: number;
  }>;
}

const STORAGE_KEY = "poker-trainer-stats";

function emptyZoneStats() {
  return {
    green: { total: 0, correct: 0 },
    yellow: { total: 0, correct: 0 },
    red: { total: 0, correct: 0 },
  };
}

function emptyStreetStats() {
  return {
    preflop: { total: 0, correct: 0 },
    flop: { total: 0, correct: 0 },
    turn: { total: 0, correct: 0 },
  };
}

function emptyPositionStats() {
  return {
    BTN: { total: 0, correct: 0 },
    SB: { total: 0, correct: 0 },
    BB: { total: 0, correct: 0 },
  };
}

export function createEmptyStats(): TrainerStats {
  return {
    total: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    byZone: emptyZoneStats(),
    byStreet: emptyStreetStats(),
    byPosition: emptyPositionStats(),
    history: [],
  };
}

export function loadStats(): TrainerStats {
  if (typeof window === "undefined") return createEmptyStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyStats();
    return JSON.parse(raw) as TrainerStats;
  } catch {
    return createEmptyStats();
  }
}

export function saveStats(stats: TrainerStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordAnswer(
  stats: TrainerStats,
  correct: boolean,
  zone: StackZone,
  street: Street,
  position: Position
): TrainerStats {
  const next = { ...stats };
  next.total += 1;
  if (correct) next.correct += 1;

  next.streak = correct ? next.streak + 1 : 0;
  next.bestStreak = Math.max(next.bestStreak, next.streak);

  next.byZone = { ...stats.byZone };
  next.byZone[zone] = {
    total: stats.byZone[zone].total + 1,
    correct: stats.byZone[zone].correct + (correct ? 1 : 0),
  };

  next.byStreet = { ...stats.byStreet };
  next.byStreet[street] = {
    total: stats.byStreet[street].total + 1,
    correct: stats.byStreet[street].correct + (correct ? 1 : 0),
  };

  next.byPosition = { ...stats.byPosition };
  next.byPosition[position] = {
    total: stats.byPosition[position].total + 1,
    correct: stats.byPosition[position].correct + (correct ? 1 : 0),
  };

  next.history = [
    { correct, zone, street, position, timestamp: Date.now() },
    ...stats.history,
  ].slice(0, 50);

  return next;
}

export function accuracy(total: number, correct: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
