import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import type { backendInterface } from "../backend";
import Blackjack from "../games/Blackjack";
import CoinFlip from "../games/CoinFlip";
import DiceRoll from "../games/DiceRoll";
import Roulette from "../games/Roulette";

type GameId = "coinflip" | "diceroll" | "roulette" | "blackjack" | null;

const GAMES = [
  {
    id: "coinflip" as const,
    name: "Coin Flip",
    emoji: "🪙",
    category: "table",
    desc: "50/50 odds. Win 2x your bet.",
    tag: "Popular",
  },
  {
    id: "diceroll" as const,
    name: "Dice Roll",
    emoji: "🎲",
    category: "table",
    desc: "Guess the number. Win 5x.",
    tag: "High Odds",
  },
  {
    id: "roulette" as const,
    name: "Roulette",
    emoji: "🎡",
    category: "table",
    desc: "Red or Black, classic rules.",
    tag: "Classic",
  },
  {
    id: "blackjack" as const,
    name: "Blackjack",
    emoji: "🃏",
    category: "table",
    desc: "Beat the dealer to 21.",
    tag: "Strategy",
  },
  {
    id: null,
    name: "Slots",
    emoji: "🎰",
    category: "slots",
    desc: "Coming soon!",
    tag: "Soon",
    disabled: true,
  },
  {
    id: null,
    name: "Texas Hold'em",
    emoji: "♠️",
    category: "live",
    desc: "Coming soon!",
    tag: "Soon",
    disabled: true,
  },
];

const ocidMap: Record<string, string> = {
  coinflip: "lobby.coinflip_button",
  diceroll: "lobby.diceroll_button",
  roulette: "lobby.roulette_button",
  blackjack: "lobby.blackjack_button",
};

interface GameLobbyProps {
  actor: backendInterface | null;
  onBalanceRefresh: () => void;
}

export default function GameLobby({ actor, onBalanceRefresh }: GameLobbyProps) {
  const [activeGame, setActiveGame] = useState<GameId>(null);
  const [tab, setTab] = useState("all");

  const filtered = GAMES.filter((g) => {
    if (tab === "all") return true;
    if (tab === "slots") return g.category === "slots";
    if (tab === "table") return g.category === "table";
    if (tab === "live") return g.category === "live";
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground mb-2">
          Game Lobby
        </h1>
        <p className="text-muted-foreground">
          Choose your game and start winning
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary/50 border border-border mb-8">
          <TabsTrigger
            value="all"
            data-ocid="lobby.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All Games
          </TabsTrigger>
          <TabsTrigger
            value="table"
            data-ocid="lobby.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Table Games
          </TabsTrigger>
          <TabsTrigger
            value="slots"
            data-ocid="lobby.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Slots
          </TabsTrigger>
          <TabsTrigger
            value="live"
            data-ocid="lobby.tab"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Live Casino
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((game) => (
              <Card
                key={game.name}
                className={`casino-card overflow-hidden group ${
                  game.disabled
                    ? "opacity-60"
                    : "casino-glow hover:-translate-y-1 cursor-pointer transition-all duration-300"
                }`}
              >
                <CardContent className="p-0">
                  <div className="h-36 bg-gradient-to-br from-secondary to-background flex items-center justify-center text-7xl">
                    {game.emoji}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {game.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-xs border-primary/30 text-primary"
                      >
                        {game.tag}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {game.desc}
                    </p>
                    {!game.disabled && game.id && (
                      <Button
                        size="sm"
                        data-ocid={ocidMap[game.id]}
                        onClick={() => setActiveGame(game.id)}
                        className="w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground font-semibold gap-1"
                      >
                        Play Now <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={activeGame === "coinflip"}
        onOpenChange={(o) => !o && setActiveGame(null)}
      >
        <DialogContent className="casino-card border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gold-gradient">
              🪙 Coin Flip
            </DialogTitle>
          </DialogHeader>
          <CoinFlip actor={actor} onBalanceRefresh={onBalanceRefresh} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeGame === "diceroll"}
        onOpenChange={(o) => !o && setActiveGame(null)}
      >
        <DialogContent className="casino-card border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gold-gradient">
              🎲 Dice Roll
            </DialogTitle>
          </DialogHeader>
          <DiceRoll actor={actor} onBalanceRefresh={onBalanceRefresh} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeGame === "roulette"}
        onOpenChange={(o) => !o && setActiveGame(null)}
      >
        <DialogContent className="casino-card border-primary/20 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gold-gradient">
              🎡 Roulette
            </DialogTitle>
          </DialogHeader>
          <Roulette actor={actor} onBalanceRefresh={onBalanceRefresh} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={activeGame === "blackjack"}
        onOpenChange={(o) => !o && setActiveGame(null)}
      >
        <DialogContent className="casino-card border-primary/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl gold-gradient">
              🃏 Blackjack
            </DialogTitle>
          </DialogHeader>
          <Blackjack actor={actor} onBalanceRefresh={onBalanceRefresh} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
