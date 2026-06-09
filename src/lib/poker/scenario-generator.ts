import {
  assertUniqueCards,
  createDeck,
  deal,
  shuffle,
} from "./deck";
import { resolveEffectivePosition } from "./effective-position";
import { getAvailableActions } from "./available-actions";
import { resolveCorrectActions } from "./action-validator";
import {
  ActionEvent,
  Card,
  PlayerCount,
  Position,
  PostflopScenarioType,
  Scenario,
  Street,
} from "./types";
import {
  getStackZone,
  isPostflopAllowed,
  resolveStrategyMode,
} from "./stack-zone";
import { evaluateHandStrength, isDryBoard } from "./postflop/board-analyzer";
import { countOuts } from "./postflop/outs-calculator";
import { isHeroHandInOpenRaiseRange } from "./ranges";
import { computePreflopPotBB } from "./pot-calculator";

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomStack(): number {
  const weights = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 25];
  return randomChoice(weights);
}

function randomPosition(playerCount: PlayerCount): Position {
  if (playerCount === "headsUp") {
    return Math.random() < 0.5 ? "BTN" : "BB";
  }
  const r = Math.random();
  if (r < 0.33) return "BTN";
  if (r < 0.66) return "SB";
  return "BB";
}

function recreationalShortStackVillainHU(
  stackBB: number
): {
  history: ActionEvent[];
  isFirstToAct: boolean;
  facingAction: ActionEvent["action"] | null;
  callAmountBB: number;
} {
  const r = Math.random();
  if (r < 0.35) {
    return {
      history: [{ actor: "villain", action: "allin", amountBB: stackBB - 1 }],
      isFirstToAct: false,
      facingAction: "allin",
      callAmountBB: stackBB - 2,
    };
  }
  if (r < 0.7) {
    return {
      history: [{ actor: "villain", action: "raise_2bb", amountBB: 2 }],
      isFirstToAct: false,
      facingAction: "raise_2bb",
      callAmountBB: 1,
    };
  }
  return {
    history: [{ actor: "villain", action: "limp" }],
    isFirstToAct: true,
    facingAction: "limp",
    callAmountBB: 0,
  };
}

function buildPreflopHistory(
  position: Position,
  effectivePosition: Position,
  playerCount: PlayerCount,
  strategyMode: Scenario["strategyMode"],
  stackBB: number
): { history: ActionEvent[]; isFirstToAct: boolean; facingAction: ActionEvent["action"] | null; callAmountBB: number } {
  if (playerCount === "headsUp") {
    if (position === "BTN") {
      return { history: [], isFirstToAct: true, facingAction: null, callAmountBB: 0 };
    }
    if (strategyMode === "push_fold" || strategyMode === "hu_survival") {
      return recreationalShortStackVillainHU(stackBB);
    }
    return {
      history: [{ actor: "villain", action: "raise_2bb", amountBB: 2 }],
      isFirstToAct: false,
      facingAction: "raise_2bb",
      callAmountBB: 1,
    };
  }

  if (effectivePosition === "BTN") {
    return { history: [], isFirstToAct: true, facingAction: null, callAmountBB: 0 };
  }

  if (effectivePosition === "SB") {
    const r = Math.random();
    if (r < 0.5) {
      return {
        history: [{ actor: "BTN", action: "fold" }],
        isFirstToAct: true,
        facingAction: null,
        callAmountBB: 0,
      };
    }
    if (r < 0.8) {
      return {
        history: [{ actor: "BTN", action: "raise_2bb", amountBB: 2 }],
        isFirstToAct: false,
        facingAction: "raise_2bb",
        callAmountBB: 1.5,
      };
    }
    return {
      history: [{ actor: "BTN", action: "limp" }],
      isFirstToAct: false,
      facingAction: "limp",
      callAmountBB: 0.5,
    };
  }

  // BB
  const r = Math.random();
  if (strategyMode === "push_fold") {
    if (r < 0.35) {
      return {
        history: [{ actor: "villain", action: "allin", amountBB: stackBB - 1 }],
        isFirstToAct: false,
        facingAction: "allin",
        callAmountBB: stackBB - 2,
      };
    }
    if (r < 0.6) {
      return {
        history: [
          { actor: "BTN", action: "raise_2bb", amountBB: 2 },
          { actor: "SB", action: "fold" },
        ],
        isFirstToAct: false,
        facingAction: "raise_2bb",
        callAmountBB: 1,
      };
    }
    if (r < 0.8) {
      return {
        history: [{ actor: "BTN", action: "limp" }, { actor: "SB", action: "fold" }],
        isFirstToAct: true,
        facingAction: "limp",
        callAmountBB: 0,
      };
    }
    return {
      history: [{ actor: "SB", action: "limp" }, { actor: "BTN", action: "fold" }],
      isFirstToAct: true,
      facingAction: "limp",
      callAmountBB: 0,
    };
  }
  if (r < 0.5) {
    return {
      history: [
        { actor: "BTN", action: "raise_2bb", amountBB: 2 },
        { actor: "SB", action: "fold" },
      ],
      isFirstToAct: false,
      facingAction: "raise_2bb",
      callAmountBB: 1,
    };
  }
  if (r < 0.75) {
    return {
      history: [{ actor: "BTN", action: "limp" }, { actor: "SB", action: "fold" }],
      isFirstToAct: true,
      facingAction: "limp",
      callAmountBB: 0,
    };
  }
  return {
    history: [{ actor: "SB", action: "limp" }, { actor: "BTN", action: "fold" }],
    isFirstToAct: true,
    facingAction: "limp",
    callAmountBB: 0,
  };
}

function tryBuildBoard(
  deck: Card[],
  type: PostflopScenarioType,
  hole: [Card, Card]
): Card[] | null {
  const attemptDeck = [...deck];
  const flop = deal(attemptDeck, 3);
  const board = flop;
  const all = [...hole, ...board];
  assertUniqueCards(all);

  const strength = evaluateHandStrength(hole, board);
  const dry = isDryBoard(board);
  const outs = countOuts(hole, board);

  switch (type) {
    case "cbet":
      if (dry && (strength === "air" || strength === "weak")) return board;
      return null;
    case "draw":
      if (outs >= 8) return board;
      return null;
    case "value":
      if (strength === "strong" || strength === "monster") return board;
      return null;
    case "air":
      if (strength === "air" || strength === "weak") return board;
      return null;
    case "facing_bet":
      if (outs >= 4) return board;
      return null;
    default:
      return board;
  }
}

const MAX_POSTFLOP_ATTEMPTS = 80;
const POSTFLOP_TYPES: PostflopScenarioType[] = [
  "cbet",
  "draw",
  "value",
  "air",
  "facing_bet",
];

export function buildPostflopActionHistory(
  street: Street,
  villainChecked: boolean,
  callAmountBB: number
): ActionEvent[] {
  const history: ActionEvent[] = [
    { actor: "hero", action: "raise_2bb", amountBB: 2, street: "preflop" },
    { actor: "villain", action: "call", street: "preflop" },
  ];

  if (street === "turn") {
    history.push(
      { actor: "hero", action: "check", street: "flop" },
      { actor: "villain", action: "check", street: "flop" }
    );
  }

  const currentStreet: Street = street === "turn" ? "turn" : "flop";
  if (villainChecked) {
    history.push({ actor: "villain", action: "check", street: currentStreet });
  } else {
    history.push({
      actor: "villain",
      action: "bet_half",
      amountBB: callAmountBB,
      street: currentStreet,
    });
  }

  return history;
}

function buildPostflopScenarioFromHand(
  stackBB: number,
  position: Position,
  playerCount: PlayerCount,
  effectivePosition: Position,
  hole: [Card, Card],
  postflopType: PostflopScenarioType,
  board: Card[]
): Scenario {
  const street: Street = Math.random() < 0.6 ? "flop" : "turn";
  let fullBoard = board;
  if (street === "turn") {
    const turnDeck = shuffle(createDeck());
    removeKnownCards(turnDeck, [...hole, ...board]);
    fullBoard = [...board, turnDeck[0]];
  }

  const villainChecked = postflopType === "cbet" || postflopType === "value";
  const facingBet =
    postflopType === "draw" ||
    postflopType === "facing_bet" ||
    postflopType === "air";
  const potBB = street === "turn" ? 5 : 4.5;
  const callAmountBB = facingBet ? 1.5 : 0;

  const base: Omit<Scenario, "availableActions" | "correctActions" | "situationId"> = {
    id: crypto.randomUUID(),
    playerCount,
    position,
    effectivePosition,
    stackBB,
    holeCards: hole,
    board: fullBoard,
    potBB,
    street,
    actionHistory: buildPostflopActionHistory(
      street,
      villainChecked,
      callAmountBB
    ),
    zone: getStackZone(stackBB),
    isFirstToAct: false,
    facingAction: villainChecked ? null : "bet_half",
    callAmountBB,
    strategyMode: "standard",
    postflopType,
    heroWasPreflopAggressor: true,
    isHeadsUpPostflop: true,
    villainChecked,
  };

  const scenario: Scenario = {
    ...base,
    situationId: `postflop_${postflopType}`,
    availableActions: [],
    correctActions: [],
  };

  scenario.availableActions = getAvailableActions(scenario);
  scenario.correctActions = resolveCorrectActions(scenario);
  assertUniqueCards([...hole, ...fullBoard]);
  return scenario;
}

export function generatePostflopScenario(stackBB: number): Scenario {
  const position: Position = "BTN";
  const playerCount: PlayerCount = "headsUp";
  const effectivePosition = resolveEffectivePosition(position, playerCount);
  const preflopOpenHistory: ActionEvent[] = [];

  for (let attempt = 0; attempt < MAX_POSTFLOP_ATTEMPTS; attempt++) {
    const deck = shuffle(createDeck());
    const hole = deal(deck, 2) as [Card, Card];

    if (
      !isHeroHandInOpenRaiseRange(
        hole,
        effectivePosition,
        playerCount,
        preflopOpenHistory
      )
    ) {
      continue;
    }

    const types = shuffle([...POSTFLOP_TYPES]);
    for (const postflopType of types) {
      const boardDeck = [...deck];
      const board = tryBuildBoard(boardDeck, postflopType, hole);
      if (!board) continue;

      return buildPostflopScenarioFromHand(
        stackBB,
        position,
        playerCount,
        effectivePosition,
        hole,
        postflopType,
        board
      );
    }
  }

  // Dernier recours : main dans la range, board aléatoire (toujours post-flop cohérent)
  for (let attempt = 0; attempt < MAX_POSTFLOP_ATTEMPTS; attempt++) {
    const deck = shuffle(createDeck());
    const hole = deal(deck, 2) as [Card, Card];

    if (
      !isHeroHandInOpenRaiseRange(
        hole,
        effectivePosition,
        playerCount,
        preflopOpenHistory
      )
    ) {
      continue;
    }

    const board = deal(deck, 3);
    return buildPostflopScenarioFromHand(
      stackBB,
      position,
      playerCount,
      effectivePosition,
      hole,
      "cbet",
      board
    );
  }

  throw new Error("Impossible de générer un scénario post-flop cohérent");
}

function removeKnownCards(deck: Card[], known: Card[]): void {
  for (const k of known) {
    const idx = deck.findIndex((c) => c.rank === k.rank && c.suit === k.suit);
    if (idx >= 0) deck.splice(idx, 1);
  }
}

function generatePreflopScenario(forcePreflop = false): Scenario {
  const wantPostflop = !forcePreflop && Math.random() < 0.3;
  let stackBB = randomStack();

  if (wantPostflop) {
    stackBB = randomChoice([16, 18, 20, 22, 25]);
    if (isPostflopAllowed(stackBB)) {
      return generatePostflopScenario(stackBB);
    }
  }

  const playerCount: PlayerCount = Math.random() < 0.3 ? "headsUp" : "3max";
  const position = randomPosition(playerCount);
  const effectivePosition = resolveEffectivePosition(position, playerCount);

  let { history, isFirstToAct, facingAction, callAmountBB } = buildPreflopHistory(
    position,
    effectivePosition,
    playerCount,
    "standard",
    stackBB
  );

  const strategyMode = resolveStrategyMode(
    stackBB,
    position,
    playerCount,
    isFirstToAct,
    history.length > 0 ? history[history.length - 1] : null
  );

  if (strategyMode !== "standard") {
    const rebuilt = buildPreflopHistory(
      position,
      effectivePosition,
      playerCount,
      strategyMode,
      stackBB
    );
    history = rebuilt.history;
    isFirstToAct = rebuilt.isFirstToAct;
    facingAction = rebuilt.facingAction;
    callAmountBB = rebuilt.callAmountBB;
  }

  const deck = shuffle(createDeck());
  const hole = deal(deck, 2) as [Card, Card];

  const potBB = computePreflopPotBB(
    playerCount,
    position,
    history,
    facingAction,
    isFirstToAct
  );

  const base: Omit<Scenario, "availableActions" | "correctActions" | "situationId"> = {
    id: crypto.randomUUID(),
    playerCount,
    position,
    effectivePosition,
    stackBB,
    holeCards: hole,
    board: [],
    potBB,
    street: "preflop",
    actionHistory: history,
    zone: getStackZone(stackBB),
    isFirstToAct,
    facingAction,
    callAmountBB,
    strategyMode,
    heroWasPreflopAggressor: false,
    isHeadsUpPostflop: false,
    villainChecked: false,
  };

  const scenario: Scenario = {
    ...base,
    situationId: "preflop",
    availableActions: [],
    correctActions: [],
  };

  scenario.availableActions = getAvailableActions(scenario);
  scenario.correctActions = resolveCorrectActions(scenario);
  scenario.situationId =
    scenario.strategyMode === "standard"
      ? `preflop_${effectivePosition}`
      : `preflop_${scenario.strategyMode}`;

  return scenario;
}

export function generateScenario(): Scenario {
  return generatePreflopScenario();
}

export { formatActionHistory, formatActionHistoryByStreet } from "./action-history";
