import { motion } from "motion/react";

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface CardType {
  suit: Suit;
  rank: Rank;
  faceDown?: boolean;
  selected?: boolean;
}

interface CardProps {
  card: CardType;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function Card({ card, onClick, size = "md", animate = true }: CardProps) {
  const isRed = card.suit === "♥" || card.suit === "♦";
  
  const sizes = {
    sm: "w-12 h-16 text-xs",
    md: "w-16 h-24 text-sm",
    lg: "w-20 h-28 text-base",
  };

  if (card.faceDown) {
    return (
      <motion.div
        initial={animate ? { scale: 0, rotateY: 180 } : {}}
        animate={animate ? { scale: 1, rotateY: 0 } : {}}
        className={`${sizes[size]} bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg border-2 border-white/30 shadow-lg cursor-pointer relative overflow-hidden`}
        onClick={onClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InBhdHRlcm4iIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMyIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMiIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')] opacity-40"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={animate ? { scale: 0, rotateY: 180 } : {}}
      animate={animate ? { scale: 1, rotateY: 0 } : {}}
      whileHover={{ scale: onClick ? 1.05 : 1 }}
      className={`${sizes[size]} bg-white rounded-lg border-2 shadow-lg cursor-pointer relative ${
        card.selected ? "border-yellow-400 ring-2 ring-yellow-400 -translate-y-2" : "border-gray-300"
      } ${onClick ? "hover:shadow-xl" : ""}`}
      onClick={onClick}
    >
      {/* Top Left */}
      <div className={`absolute top-1 left-1 ${isRed ? "text-red-600" : "text-black"} font-bold`}>
        <div className="leading-none">{card.rank}</div>
        <div className="text-lg leading-none">{card.suit}</div>
      </div>

      {/* Center */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${isRed ? "text-red-600" : "text-black"} text-3xl`}>
        {card.suit}
      </div>

      {/* Bottom Right (rotated) */}
      <div className={`absolute bottom-1 right-1 ${isRed ? "text-red-600" : "text-black"} font-bold rotate-180`}>
        <div className="leading-none">{card.rank}</div>
        <div className="text-lg leading-none">{card.suit}</div>
      </div>
    </motion.div>
  );
}

// Utility function to create a deck
export function createDeck(): CardType[] {
  const suits: Suit[] = ["♠", "♥", "♦", "♣"];
  const ranks: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const deck: CardType[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

// Shuffle deck
export function shuffleDeck(deck: CardType[]): CardType[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get card value for Blackjack
export function getCardValue(card: CardType, currentTotal: number = 0): number {
  if (card.rank === "A") {
    return currentTotal + 11 > 21 ? 1 : 11;
  }
  if (["J", "Q", "K"].includes(card.rank)) {
    return 10;
  }
  return parseInt(card.rank);
}

// Get hand total for Blackjack
export function getHandTotal(cards: CardType[]): number {
  let total = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === "A") {
      aces++;
      total += 11;
    } else if (["J", "Q", "K"].includes(card.rank)) {
      total += 10;
    } else {
      total += parseInt(card.rank);
    }
  }

  // Adjust for aces
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}
