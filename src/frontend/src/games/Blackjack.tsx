import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { GameType } from "../backend";
import type { backendInterface } from "../backend";

interface BlackjackProps {
  actor: backendInterface | null;
  onBalanceRefresh: () => void;
}

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

interface Card {
  rank: Rank;
  suit: Suit;
  value: number;
  id: string;
}

type Phase = "betting" | "playing" | "dealer" | "result";

const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

function cardValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (["J", "Q", "K"].includes(rank)) return 10;
  return Number.parseInt(rank);
}

let cardCounter = 0;
function dealCard(): Card {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  cardCounter += 1;
  return { rank, suit, value: cardValue(rank), id: `card-${cardCounter}` };
}

function handTotal(hand: Card[]): number {
  let total = hand.reduce((sum, c) => sum + c.value, 0);
  let aces = hand.filter((c) => c.rank === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function isRedSuit(suit: Suit): boolean {
  return suit === "♥" || suit === "♦";
}

function PlayingCard({
  card,
  hidden = false,
  animating = false,
}: { card: Card; hidden?: boolean; animating?: boolean }) {
  return (
    <div
      className={`w-14 h-20 rounded-lg border-2 flex flex-col items-center justify-center text-sm font-bold shadow-lg ${
        hidden
          ? "bg-gradient-to-br from-blue-900 to-blue-800 border-blue-600"
          : "bg-card border-border"
      } ${animating ? "animate-card-deal" : ""}`}
    >
      {hidden ? (
        <span className="text-2xl">🂠</span>
      ) : (
        <>
          <span
            className={
              isRedSuit(card.suit) ? "text-red-400" : "text-foreground"
            }
          >
            {card.rank}
          </span>
          <span
            className={`text-lg ${isRedSuit(card.suit) ? "text-red-400" : "text-foreground"}`}
          >
            {card.suit}
          </span>
        </>
      )}
    </div>
  );
}

export default function Blackjack({ actor, onBalanceRefresh }: BlackjackProps) {
  const [betAmount, setBetAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("betting");
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [resultMsg, setResultMsg] = useState("");
  const [won, setWon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startGame = () => {
    const bet = Number.parseInt(betAmount);
    if (bet <= 0) return;
    const p1 = dealCard();
    const p2 = dealCard();
    const d1 = dealCard();
    const d2 = dealCard();
    setPlayerHand([p1, p2]);
    setDealerHand([d1, d2]);
    setPhase("playing");
    setResultMsg("");
  };

  const hit = () => {
    const newCard = dealCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    if (handTotal(newHand) > 21) {
      resolveGame(newHand, dealerHand, false, "bust");
    }
  };

  const stand = async () => {
    let currentDealer = [...dealerHand];
    while (handTotal(currentDealer) < 17) {
      currentDealer = [...currentDealer, dealCard()];
    }
    setDealerHand(currentDealer);
    const pTotal = handTotal(playerHand);
    const dTotal = handTotal(currentDealer);
    const playerWon = pTotal <= 21 && (dTotal > 21 || pTotal > dTotal);
    const outcome =
      dTotal > 21
        ? `Player ${pTotal} vs Dealer bust (${dTotal})`
        : `Player ${pTotal} vs Dealer ${dTotal}`;
    resolveGame(playerHand, currentDealer, playerWon, outcome);
  };

  const resolveGame = async (
    pHand: Card[],
    dHand: Card[],
    playerWon: boolean,
    outcome: string,
  ) => {
    setIsLoading(true);
    const bet = Number.parseInt(betAmount);
    const pTotal = handTotal(pHand);

    let msg = "";
    if (pTotal > 21) {
      msg = "Bust! You went over 21.";
    } else if (playerWon) {
      msg = `You win! ${handTotal(pHand)} vs Dealer ${handTotal(dHand)}.`;
    } else if (handTotal(dHand) === pTotal) {
      msg = "Push! It's a tie.";
    } else {
      msg = `Dealer wins. ${pTotal} vs ${handTotal(dHand)}.`;
    }

    setResultMsg(msg);
    setWon(playerWon);
    setPhase("result");

    try {
      await actor?.recordGameResult({
        won: playerWon,
        betAmount: BigInt(bet),
        gameType: GameType.blackjack,
        outcome,
        payout: playerWon ? BigInt(bet * 2) : 0n,
      });
      onBalanceRefresh();
      if (playerWon) {
        toast.success(`🃏 ${msg} +${(bet * 2).toLocaleString()} credits!`);
      } else {
        toast.error(`🃏 ${msg}`);
      }
    } catch {
      toast.error("Failed to record game result.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPhase("betting");
    setPlayerHand([]);
    setDealerHand([]);
    setResultMsg("");
    setBetAmount("");
  };

  const playerTotal = handTotal(playerHand);
  const dealerTotal = handTotal(dealerHand);

  return (
    <div className="space-y-5 py-2">
      {/* Dealer hand */}
      {phase !== "betting" && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Dealer's Hand {phase === "result" ? `(${dealerTotal})` : ""}
          </p>
          <div className="flex gap-2 flex-wrap">
            {dealerHand.map((card, i) => (
              <PlayingCard
                key={card.id}
                card={card}
                hidden={phase === "playing" && i === 1}
                animating={i === dealerHand.length - 1 && phase === "dealer"}
              />
            ))}
          </div>
        </div>
      )}

      {/* Player hand */}
      {phase !== "betting" && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Your Hand ({playerTotal})
          </p>
          <div className="flex gap-2 flex-wrap">
            {playerHand.map((card, i) => (
              <PlayingCard
                key={card.id}
                card={card}
                animating={i === playerHand.length - 1 && phase === "playing"}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {phase === "result" && (
        <div
          className={`text-center p-4 rounded-lg border ${
            won
              ? "bg-green-900/20 border-green-700/40 text-green-400"
              : "bg-red-900/20 border-red-700/40 text-red-400"
          }`}
        >
          <p className="text-lg font-display font-bold">
            {won ? "🎉 You Won!" : "😔 You Lost"}
          </p>
          <p className="text-sm mt-1">{resultMsg}</p>
        </div>
      )}

      {/* Bet input - only in betting phase */}
      {phase === "betting" && (
        <div className="space-y-2">
          <Label htmlFor="bj-bet" className="text-muted-foreground">
            Bet Amount (Credits)
          </Label>
          <Input
            id="bj-bet"
            data-ocid="blackjack.bet_input"
            type="number"
            placeholder="Enter bet amount..."
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="bg-input border-border"
            min="1"
          />
        </div>
      )}

      {/* Action buttons */}
      {phase === "betting" && (
        <Button
          data-ocid="blackjack.start_button"
          onClick={startGame}
          disabled={!betAmount || Number.parseInt(betAmount) <= 0}
          className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold text-lg h-12 casino-glow"
        >
          🃏 Deal Cards
        </Button>
      )}

      {phase === "playing" && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            data-ocid="blackjack.hit_button"
            onClick={hit}
            disabled={isLoading}
            className="h-12 bg-blue-800/50 text-blue-300 border border-blue-700/50 hover:bg-blue-700/50 font-bold"
          >
            Hit +
          </Button>
          <Button
            data-ocid="blackjack.stand_button"
            onClick={stand}
            disabled={isLoading}
            className="h-12 bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground font-bold"
          >
            Stand ✋
          </Button>
        </div>
      )}

      {phase === "result" && (
        <Button
          onClick={reset}
          className="w-full bg-secondary text-foreground hover:bg-secondary/80 font-semibold"
        >
          Play Again
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Closest to 21 wins • Win 2× your bet
      </p>
    </div>
  );
}
