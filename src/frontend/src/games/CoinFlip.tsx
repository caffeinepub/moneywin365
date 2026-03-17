import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { GameType } from "../backend";
import type { backendInterface } from "../backend";

interface CoinFlipProps {
  actor: backendInterface | null;
  onBalanceRefresh: () => void;
}

type Choice = "heads" | "tails" | null;
type Phase = "idle" | "flipping" | "result";

export default function CoinFlip({ actor, onBalanceRefresh }: CoinFlipProps) {
  const [choice, setChoice] = useState<Choice>(null);
  const [betAmount, setBetAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{
    won: boolean;
    outcome: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (!actor || !choice || !betAmount) return;
    const bet = Number.parseInt(betAmount);
    if (bet <= 0) return;

    setPhase("flipping");
    setResult(null);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 1300));

    const outcome = Math.random() < 0.5 ? "heads" : "tails";
    const won = outcome === choice;
    const payout = won ? BigInt(bet * 2) : 0n;

    try {
      await actor.recordGameResult({
        won,
        betAmount: BigInt(bet),
        gameType: GameType.coinFlip,
        outcome,
        payout,
      });
      setResult({ won, outcome });
      setPhase("result");
      onBalanceRefresh();
      if (won) {
        toast.success(`🎉 You won ${(bet * 2).toLocaleString()} credits!`);
      } else {
        toast.error(`😔 It was ${outcome}. Better luck next time!`);
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
    setChoice(null);
    setBetAmount("");
  };

  return (
    <div className="space-y-6 py-2">
      {/* Coin display */}
      <div className="flex justify-center">
        <div
          className={`w-28 h-28 rounded-full border-4 border-primary/60 flex items-center justify-center text-5xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-[0_0_30px_oklch(0.78_0.18_68/0.2)] ${
            phase === "flipping" ? "animate-coin-flip" : ""
          } ${phase === "result" && result?.won ? "animate-winner-glow" : ""}`}
        >
          {phase === "idle"
            ? "🪙"
            : phase === "flipping"
              ? "🪙"
              : result?.outcome === "heads"
                ? "👑"
                : "🦅"}
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
          <p className="text-sm mt-1 capitalize">
            Result: <strong>{result.outcome}</strong>{" "}
            {result.won
              ? `• +${(Number.parseInt(betAmount) * 2).toLocaleString()} credits`
              : `• -${Number.parseInt(betAmount).toLocaleString()} credits`}
          </p>
        </div>
      )}

      {/* Choice buttons */}
      <div>
        <Label className="text-muted-foreground text-sm mb-3 block">
          Pick a side
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            data-ocid="coinflip.heads_button"
            variant="outline"
            onClick={() => {
              setChoice("heads");
              setPhase("idle");
              setResult(null);
            }}
            disabled={phase === "flipping"}
            className={`h-14 text-lg border-2 transition-all ${
              choice === "heads"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            👑 Heads
          </Button>
          <Button
            data-ocid="coinflip.tails_button"
            variant="outline"
            onClick={() => {
              setChoice("tails");
              setPhase("idle");
              setResult(null);
            }}
            disabled={phase === "flipping"}
            className={`h-14 text-lg border-2 transition-all ${
              choice === "tails"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border hover:border-primary/50"
            }`}
          >
            🦅 Tails
          </Button>
        </div>
      </div>

      {/* Bet input */}
      <div className="space-y-2">
        <Label htmlFor="cf-bet" className="text-muted-foreground">
          Bet Amount (Credits)
        </Label>
        <Input
          id="cf-bet"
          data-ocid="coinflip.bet_input"
          type="number"
          placeholder="Enter bet amount..."
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={phase === "flipping"}
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
          data-ocid="coinflip.play_button"
          onClick={handlePlay}
          disabled={
            !choice ||
            !betAmount ||
            Number.parseInt(betAmount) <= 0 ||
            isLoading ||
            phase === "flipping"
          }
          className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold text-lg h-12 casino-glow"
        >
          {phase === "flipping" ? "Flipping..." : "🪙 Flip Coin"}
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        50/50 odds • Win 2× your bet
      </p>
    </div>
  );
}
