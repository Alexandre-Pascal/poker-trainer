import { Card, RANKS, Suit } from "./types";

const SUITS: Suit[] = ["h", "d", "c", "s"];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return deck;
}

export function cardKey(card: Card): string {
  return `${card.rank}${card.suit}`;
}

export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const deck = [...items];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function deal(deck: Card[], n: number): Card[] {
  if (n > deck.length) {
    throw new Error(`Cannot deal ${n} cards from deck of ${deck.length}`);
  }
  return deck.splice(0, n);
}

export function removeCards(deck: Card[], cards: Card[]): void {
  for (const card of cards) {
    const idx = deck.findIndex(
      (c) => c.rank === card.rank && c.suit === card.suit
    );
    if (idx === -1) {
      throw new Error(`Card not in deck: ${cardKey(card)}`);
    }
    deck.splice(idx, 1);
  }
}

export function assertUniqueCards(cards: Card[]): void {
  const keys = cards.map(cardKey);
  if (new Set(keys).size !== keys.length) {
    throw new Error("Duplicate cards detected");
  }
}

export function randomHand(deck: Card[]): [Card, Card] {
  const dealt = deal(deck, 2);
  return [dealt[0], dealt[1]];
}
