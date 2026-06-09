export const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "J",
  "Q",
  "K",
  "A",
] as const;

export type Rank = (typeof RANKS)[number];
export type Suit = "h" | "d" | "c" | "s";

export type Position = "BTN" | "SB" | "BB";
export type StackZone = "green" | "yellow" | "red";
export type Street = "preflop" | "flop" | "turn";
export type PlayerCount = "3max" | "headsUp";

export type PreviousActionType =
  | "fold"
  | "raise_2bb"
  | "raise_4bb"
  | "raise_6bb"
  | "limp"
  | "check"
  | "bet"
  | "bet_third"
  | "bet_half"
  | "allin"
  | "call";

export type UserAction =
  | "fold"
  | "call"
  | "check"
  | "bet_third"
  | "bet_half"
  | "allin"
  | "raise_2bb"
  | "raise_4bb"
  | "raise_6bb";

export interface Card {
  rank: Rank;
  suit: Suit;
}

export interface ParsedHand {
  high: Rank;
  low: Rank;
  suited: boolean;
  isPair: boolean;
}

export interface ActionEvent {
  actor: "hero" | "villain" | "BTN" | "SB" | "BB";
  action: PreviousActionType;
  amountBB?: number;
  street?: Street;
}

export type PostflopScenarioType =
  | "cbet"
  | "draw"
  | "value"
  | "air"
  | "facing_bet";

export interface Scenario {
  id: string;
  playerCount: PlayerCount;
  position: Position;
  effectivePosition: Position;
  stackBB: number;
  holeCards: [Card, Card];
  board: Card[];
  potBB: number;
  street: Street;
  actionHistory: ActionEvent[];
  zone: StackZone;
  situationId: string;
  isFirstToAct: boolean;
  facingAction: PreviousActionType | null;
  callAmountBB: number;
  availableActions: UserAction[];
  correctActions: UserAction[];
  strategyMode: "standard" | "push_fold" | "wide_push" | "hu_survival";
  postflopType?: PostflopScenarioType;
  heroWasPreflopAggressor: boolean;
  isHeadsUpPostflop: boolean;
  villainChecked: boolean;
}

export interface RangeRule {
  situationId: string;
  position: Position;
  strategyMode: Scenario["strategyMode"];
  matchActions: (history: ActionEvent[], playerCount: PlayerCount) => boolean;
  inRangeActions: UserAction[];
  outOfRangeActions: UserAction[];
  ranges: string[];
  isolateRanges?: string[];
  completeRanges?: string[];
  threeBetRanges?: string[];
  callRanges?: string[];
  checkRanges?: string[];
  ruleRef: string;
  description: string;
}

export interface ValidationResult {
  isCorrect: boolean;
  correctActions: UserAction[];
  explanation: string;
  ruleRef: string;
}

export const RANK_VALUES: Record<Rank, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  T: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};
