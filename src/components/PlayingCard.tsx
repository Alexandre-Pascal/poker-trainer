import { Card } from "@/lib/poker/types";
import { cn } from "@/lib/utils";

const SUIT_SYMBOLS: Record<string, string> = {
  h: "♥",
  d: "♦",
  c: "♣",
  s: "♠",
};

const RED_SUITS = new Set(["h", "d"]);

interface PlayingCardProps {
  card: Card;
  className?: string;
  small?: boolean;
}

export function PlayingCard({ card, className, small }: PlayingCardProps) {
  const isRed = RED_SUITS.has(card.suit);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border-2 border-slate-600 bg-white font-bold shadow-md",
        small ? "h-14 w-10 text-sm" : "h-24 w-16 text-xl",
        isRed ? "text-red-600" : "text-slate-900",
        className
      )}
    >
      <span>{card.rank}</span>
      <span className={small ? "text-base" : "text-2xl"}>{SUIT_SYMBOLS[card.suit]}</span>
    </div>
  );
}
