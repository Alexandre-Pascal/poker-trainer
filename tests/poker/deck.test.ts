import { describe, expect, it } from "vitest";
import {
  assertUniqueCards,
  cardKey,
  createDeck,
  deal,
  removeCards,
  shuffle,
} from "@/lib/poker/deck";

describe("deck", () => {
  it("creates 52 unique cards", () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    const keys = deck.map(cardKey);
    expect(new Set(keys).size).toBe(52);
  });

  it("deal removes cards from deck", () => {
    const deck = shuffle(createDeck());
    const hero = deal(deck, 2);
    const flop = deal(deck, 3);
    const all = [...hero, ...flop];
    assertUniqueCards(all);
    expect(deck).toHaveLength(47);
  });

  it("removeCards works", () => {
    const deck = createDeck();
    const toRemove = deck.slice(0, 2);
    removeCards(deck, toRemove);
    expect(deck).toHaveLength(50);
  });

  it("no duplicate between hero and board", () => {
    const deck = shuffle(createDeck());
    const hero = deal(deck, 2);
    const board = deal(deck, 3);
    const keys = [...hero, ...board].map(cardKey);
    expect(new Set(keys).size).toBe(5);
  });
});
