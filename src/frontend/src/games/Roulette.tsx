import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { GameType } from "../backend";
import type { backendInterface } from "../backend";

interface RouletteProps {
  actor: backendInterface | null;
  onBalanceRefresh: () => void;
}

type ColorChoice = "red" | "black" | null;
type Phase = "idle" | "spinning" | "result";

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
];

export default function Roulette({ actor, onBalanceRefresh }: RouletteProps) {
  const [colorChoice, setColorChoice] = useState<ColorChoice>(null);
  const [betAmount, setBetAmount] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<{
    won: boolean;
    number: number;
    color: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);

  const handlePlay = async () => {
    if (!actor || !colorChoice || !betAmount) return;
    const bet = Number.parseInt(betAmount);
    if (bet <= 0) return;

    const targetDeg = spinDeg + 1440 + Math.floor(Math.random() * 360);
    setSpinDeg(targetDeg);
    setPhase("spinning");
    setResult(null);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 2200));

    const rnd = Math.floor(Math.random() * 37); // 0-36
    const num = rnd;
    const color =
      num === 0 ? "green" : RED_NUMBERS.includes(num) ? "red" : "black";
    const won = color === colorChoice;
    const payout = won ? BigInt(bet * 2) : 0n;

    try {
      await actor.recordGameResult({
        won,
        betAmount: BigInt(bet),
        gameType: GameType.roulette,
        outcome: `${num} ${color}`,
        payout,
      });
      setResult({ won, number: num, color });
      setPhase("result");
      onBalanceRefresh();
      if (won) {
        toast.success(
          `🎡 ${num} ${color}! You won ${(bet * 2).toLocaleString()} credits!`,
        );
      } else {
        toast.error(`🎡 ${num} ${color}. Better luck next time!`);
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
    setColorChoice(null);
    setBetAmount("");
  };

  return (
    <div className="space-y-6 py-2">
      {/* Wheel display */}
      <div className="flex justify-center">
        <div className="relative w-32 h-32">
          <div
            className="w-32 h-32 rounded-full border-4 border-primary/50 flex items-center justify-center text-5xl overflow-hidden"
            style={{
              background:
                "conic-gradient(#c0392b 0deg 10deg, #2c3e50 10deg 20deg, #c0392b 20deg 30deg, #2c3e50 30deg 40deg, #c0392b 40deg 50deg, #2c3e50 50deg 60deg, #c0392b 60deg 70deg, #2c3e50 70deg 80deg, #c0392b 80deg 90deg, #2c3e50 90deg 100deg, #27ae60 100deg 110deg, #c0392b 110deg 120deg, #2c3e50 120deg 130deg, #c0392b 130deg 140deg, #2c3e50 140deg 150deg, #c0392b 150deg 160deg, #2c3e50 160deg 170deg, #c0392b 170deg 180deg, #2c3e50 180deg 190deg, #c0392b 190deg 200deg, #2c3e50 200deg 210deg, #c0392b 210deg 220deg, #2c3e50 220deg 230deg, #c0392b 230deg 240deg, #2c3e50 240deg 250deg, #c0392b 250deg 260deg, #2c3e50 260deg 270deg, #c0392b 270deg 280deg, #2c3e50 280deg 290deg, #c0392b 290deg 300deg, #2c3e50 300deg 310deg, #c0392b 310deg 320deg, #2c3e50 320deg 330deg, #c0392b 330deg 340deg, #2c3e50 340deg 350deg, #c0392b 350deg 360deg)",
              transform: `rotate(${spinDeg}deg)`,
              transition:
                phase === "spinning"
                  ? "transform 2s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "none",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-background border-2 border-primary/50 flex items-center justify-center">
              {phase === "result" && result ? (
                <span
                  className="text-xs font-bold"
                  style={{
                    color:
                      result.color === "red"
                        ? "#c0392b"
                        : result.color === "black"
                          ? "#aaa"
                          : "#27ae60",
                  }}
                >
                  {result.number}
                </span>
              ) : (
                <span className="text-white text-xs">🎡</span>
              )}
            </div>
          </div>
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
            Landed:{" "}
            <strong>
              {result.number} {result.color}
            </strong>
            {result.won
              ? ` • +${(Number.parseInt(betAmount) * 2).toLocaleString()} credits`
              : ` • -${Number.parseInt(betAmount).toLocaleString()} credits`}
          </p>
        </div>
      )}

      {/* Color choice */}
      <div>
        <Label className="text-muted-foreground text-sm mb-3 block">
          Pick a color
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            data-ocid="roulette.red_button"
            variant="outline"
            onClick={() => {
              setColorChoice("red");
              setPhase("idle");
              setResult(null);
            }}
            disabled={phase === "spinning"}
            className={`h-14 text-lg border-2 transition-all ${
              colorChoice === "red"
                ? "border-red-500 bg-red-900/30 text-red-400"
                : "border-border hover:border-red-500/50"
            }`}
          >
            🔴 Red
          </Button>
          <Button
            data-ocid="roulette.black_button"
            variant="outline"
            onClick={() => {
              setColorChoice("black");
              setPhase("idle");
              setResult(null);
            }}
            disabled={phase === "spinning"}
            className={`h-14 text-lg border-2 transition-all ${
              colorChoice === "black"
                ? "border-slate-400 bg-slate-900/50 text-slate-300"
                : "border-border hover:border-slate-400/50"
            }`}
          >
            ⚫ Black
          </Button>
        </div>
      </div>

      {/* Bet input */}
      <div className="space-y-2">
        <Label htmlFor="rl-bet" className="text-muted-foreground">
          Bet Amount (Credits)
        </Label>
        <Input
          id="rl-bet"
          data-ocid="roulette.bet_input"
          type="number"
          placeholder="Enter bet amount..."
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          disabled={phase === "spinning"}
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
          data-ocid="roulette.play_button"
          onClick={handlePlay}
          disabled={
            !colorChoice ||
            !betAmount ||
            Number.parseInt(betAmount) <= 0 ||
            isLoading ||
            phase === "spinning"
          }
          className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold text-lg h-12 casino-glow"
        >
          {phase === "spinning" ? "Spinning..." : "🎡 Spin the Wheel"}
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        ~48.6% odds • Win 2× your bet
      </p>
    </div>
  );
}
