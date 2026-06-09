import { describe, expect, it } from "vitest";
import {
  evaluateHandStrength,
  isDangerousBoard,
  isTopPairWeakKicker,
} from "@/lib/poker/postflop/board-analyzer";
import {
  sanitizeActionsForFacingBet,
  validatePostflopAction,
} from "@/lib/poker/postflop/postflop-validator";
import { getAvailableActions } from "@/lib/poker/available-actions";
import { resolveCorrectActions } from "@/lib/poker/action-validator";
import { Scenario, UserAction } from "@/lib/poker/types";

const HOLE_A6: Scenario["holeCards"] = [
  { rank: "A", suit: "d" },
  { rank: "6", suit: "h" },
];

const BOARD_TURN: Scenario["board"] = [
  { rank: "4", suit: "s" },
  { rank: "J", suit: "h" },
  { rank: "Q", suit: "s" },
  { rank: "A", suit: "s" },
];

function a6FacingBetScenario(overrides: Partial<Scenario> = {}): Scenario {
  const base: Scenario = {
    id: "a6-turn",
    playerCount: "headsUp",
    position: "BTN",
    effectivePosition: "SB",
    stackBB: 20,
    holeCards: HOLE_A6,
    board: BOARD_TURN,
    potBB: 6,
    street: "turn",
    actionHistory: [],
    zone: "green",
    situationId: "postflop_value",
    isFirstToAct: false,
    facingAction: "bet_half",
    callAmountBB: 2,
    availableActions: ["fold", "call", "raise_6bb"],
    correctActions: [],
    strategyMode: "standard",
    postflopType: "value",
    heroWasPreflopAggressor: true,
    isHeadsUpPostflop: true,
    villainChecked: false,
  };
  return { ...base, ...overrides };
}

const BET_ACTIONS: UserAction[] = ["bet_third", "bet_half"];

function assertNoBetActionsWhenFacingBet(actions: UserAction[]) {
  for (const bet of BET_ACTIONS) {
    expect(actions).not.toContain(bet);
  }
}

describe("A6 top pair weak kicker on dangerous turn board", () => {
  it("detects dangerous connected monotone board", () => {
    expect(isDangerousBoard(BOARD_TURN)).toBe(true);
  });

  it("detects weak kicker on top pair", () => {
    expect(isTopPairWeakKicker(HOLE_A6, BOARD_TURN)).toBe(true);
  });

  it("classifies as marginal, not strong", () => {
    expect(evaluateHandStrength(HOLE_A6, BOARD_TURN)).toBe("marginal");
    expect(evaluateHandStrength(HOLE_A6, BOARD_TURN)).not.toBe("strong");
  });

  it("recommends fold (not bet) facing villain bet", () => {
    const result = validatePostflopAction(a6FacingBetScenario());
    assertNoBetActionsWhenFacingBet(result.correctActions);
    expect(result.correctActions).toContain("fold");
    expect(result.correctActions).not.toContain("bet_half");
    expect(result.correctActions).not.toContain("bet_third");
  });

  it("resolveCorrectActions never returns bet facing a bet", () => {
    const actions = resolveCorrectActions(a6FacingBetScenario());
    assertNoBetActionsWhenFacingBet(actions);
  });
});

describe("facing bet action constraints", () => {
  it("sanitizeActionsForFacingBet strips bet actions", () => {
    expect(
      sanitizeActionsForFacingBet(["bet_half", "fold", "call"], true)
    ).toEqual(["fold", "call"]);
  });

  it("available actions never include bet when villain bet", () => {
    const actions = getAvailableActions(a6FacingBetScenario());
    assertNoBetActionsWhenFacingBet(actions);
    expect(actions).toEqual(expect.arrayContaining(["fold", "call"]));
  });

  const postflopTypes: Scenario["postflopType"][] = [
    "cbet",
    "draw",
    "value",
    "air",
    "facing_bet",
  ];

  for (const postflopType of postflopTypes) {
    it(`never suggests bet as correct action for postflopType=${postflopType} facing bet`, () => {
      const result = validatePostflopAction(
        a6FacingBetScenario({ postflopType })
      );
      assertNoBetActionsWhenFacingBet(result.correctActions);
    });
  }
});
