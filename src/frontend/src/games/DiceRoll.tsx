import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { GameType } from "../backend";
import type { backendInterface } from "../backend";

interface DiceRollProps {
  actor: backendInterface | null;
  onBalanceRefresh: () => void;
}

const DICE_EMOJIS = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

type Phase = "idle" | "rolling" | "result";

export default function DiceRoll({ actor, onBalanceRefresh }: DiceRollProps) {
  const [pickedNumber, setPickedNumber] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{
    won: boolean;
    rolledNumber: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (!actor || pickedNumber === null || !betAmount) return;
    const bet = Number.parseInt(betAmount);
    if (bet <= 0) return;

    setPhase("rolling");
    setResult(null);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    const rolledNumber = Math.floor(Math.random() * 6) + 1;
    const won = rolledNumber === pickedNumber;
    const payout = won ? BigInt(bet * 5) : 0n;

    try {
      await actor.recordGameResult({
        won,
        betAmount: BigInt(bet),
        gameType: GameType.diceRoll,
        outcome: String(rolledNumber),
        payout,
      });
      setResult({ won, rolledNumber });
      setPhase("result");
      onBalanceRefresh();
      if (won) {
        toast.success(
          `🎲 Rolled ${rolledNumber}! You won ${(bet * 5).toLocaleString()} credits!`,
        );
      } else {
        toast.error(`🎲 Rolled ${rolledNumber}. Better luck next time!`);
      }
    } catch {
      toast.error("Game error. Please try again.");
      setPhase("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setPhase("idle");
    setResult(null);
    setPickedNumber(null);
    setBetAmount("");
  };

  return (
    <div className="space-y-6 py-2">
      {/* Dice display */}
      <div className="flex justify-center">
        <div
          className={`w-24 h-24 flex items-center justify-center text-6xl ${
            phase === "rolling" ? "animate-dice-roll" : ""
          } ${
            phase === "result" && result?.won
              ? "animate-winner-glow rounded-xl"
              : ""
          }`}
        >
          {phase === "idle"
            ? "🎲"
            : phase === "rolling"
              ? DICE_EMOJIS[Math.floor(Math.random() * 6)]
              : DICE_EMOJIS[(result?.rolledNumber ?? 1) - 1]}
        </div>
      </div>

      {/* Result */}
      {phase === "result" && result && (
        <div
          className={`text-center p-4 rounded-lg border ${
            result.won
              ? "bg-green-900/20 border-green-700/40 text-green-400"
              : "bg-red-900/20 border-red-700/40 text-red-400"
          }`}
        >
          <p className="text-xl font-display font-bold">
            {result.won ? "🎉 You Won!" : "😔 You Lost"}
          </p>
          <p className="text-sm mt-1">
            Rolled: <strong>{result.rolledNumber}</strong>
            {result.won
              ? ` • +${(Number.parseInt(betAmount) * 5).toLocaleString()} credits`
              : ` • -${Number.parseInt(betAmount).toLocaleString()} credits`}
          </p>
        </div>
      )}

      {/* Number picker */}
      <div>
        <Label className="text-muted-foreground text-sm mb-3 block">
          Pick a number (1–6)
        </Label>
        <div className="grid grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <Button
              key={n}
              variant="outline"
              onClick={() => {
                setPickedNumber(n);
                setPhase("idle");
                setResult(null);
              }}
              disabled={phase === "rolling"}
              className={`h-12 text-xl border-2 transition-all p-0 ${
                pickedNumber === n
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {DICE_EMOJIS[n - 1]}
            </Button>
          ))}
        </div>
      </div>

      {/* Bet input */}
      <div className="space-y-2">
        <Label htmlFor="dr-bet" className="text-muted-foreground">
          Bet Amount (Credits)
        </Label>
        <Input
          id="dr-bet"
          data-ocid="diceroll.bet_input"
          type="number"
          placeholder="Enter bet amount..."
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={phase === "rolling"}
          className="bg-input border-border"
          min="1"
        />
      </div>

      {phase === "result" ? (
        <Button
          onClick={reset}
          className="w-full bg-secondary text-foreground hover:bg-secondary/80 font-semibold"
        >
          Play Again
        </Button>
      ) : (
        <Button
          data-ocid="diceroll.play_button"
          onClick={handlePlay}
          disabled={
            pickedNumber === null ||
            !betAmount ||
            Number.parseInt(betAmount) <= 0 ||
            isLoading ||
            phase === "rolling"
          }
          className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold text-lg h-12 casino-glow"
        >
          {phase === "rolling" ? "Rolling..." : "🎲 Roll Dice"}
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        1/6 odds • Win 5× your bet
      </p>
    </div>
  );
}
