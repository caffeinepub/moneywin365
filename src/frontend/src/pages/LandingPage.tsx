import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronRight,
  Coins,
  LogIn,
  Shield,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { Gamepad2 as Gamepad, Gift } from "lucide-react";
import type { View } from "../App";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const FEATURED_GAMES = [
  {
    id: "coinflip",
    name: "Coin Flip",
    emoji: "🪙",
    desc: "50/50 odds, double your credits",
    tag: "Popular",
    color: "from-yellow-900/40 to-yellow-800/20",
  },
  {
    id: "diceroll",
    name: "Dice Roll",
    emoji: "🎲",
    desc: "Pick a number, win 5x your bet",
    tag: "High Odds",
    color: "from-blue-900/40 to-blue-800/20",
  },
  {
    id: "roulette",
    name: "Roulette",
    emoji: "🎡",
    desc: "Red or Black, classic casino thrill",
    tag: "Classic",
    color: "from-red-900/40 to-red-800/20",
  },
  {
    id: "blackjack",
    name: "Blackjack",
    emoji: "🃏",
    desc: "Beat the dealer, reach 21",
    tag: "Strategy",
    color: "from-green-900/40 to-green-800/20",
  },
  {
    id: "slots",
    name: "Slots",
    emoji: "🎰",
    desc: "Spin and match to win big",
    tag: "Coming Soon",
    color: "from-purple-900/40 to-purple-800/20",
    disabled: true,
  },
  {
    id: "poker",
    name: "Poker",
    emoji: "♠️",
    desc: "Texas Hold'em against AI",
    tag: "Coming Soon",
    color: "from-slate-900/40 to-slate-800/20",
    disabled: true,
  },
];

const RECENT_WINNERS = [
  { name: "LuckyAce99", game: "Blackjack", amount: 4500 },
  { name: "GoldRush_K", game: "Roulette", amount: 2000 },
  { name: "HighRoller7", game: "Dice Roll", amount: 12500 },
  { name: "CoinMaster_X", game: "Coin Flip", amount: 800 },
  { name: "VegasNights", game: "Blackjack", amount: 9200 },
  { name: "Thunderstruck", game: "Roulette", amount: 3400 },
  { name: "JackpotJoey", game: "Dice Roll", amount: 7500 },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Register",
    desc: "Connect with Internet Identity – secure, anonymous, no email needed",
    icon: Shield,
  },
  {
    step: 2,
    title: "Get Bonus",
    desc: "Receive 1,000 free credits instantly as your welcome bonus",
    icon: Gift,
  },
  {
    step: 3,
    title: "Play",
    desc: "Choose from our selection of exciting casino games",
    icon: Gamepad,
  },
  {
    step: 4,
    title: "Win",
    desc: "Collect your winnings and climb the leaderboards",
    icon: Trophy,
  },
];

interface LandingPageProps {
  setView: (v: View) => void;
  isLoggedIn: boolean;
}

export default function LandingPage({ setView, isLoggedIn }: LandingPageProps) {
  const { login, isLoggingIn } = useInternetIdentity();
  const { actor, isFetching } = useActor();

  const promotionsQuery = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPromotions();
    },
    enabled: !!actor && !isFetching,
  });

  const tickerWinners = [
    ...RECENT_WINNERS.map((w) => ({ ...w, tickerKey: `a-${w.name}` })),
    ...RECENT_WINNERS.map((w) => ({ ...w, tickerKey: `b-${w.name}` })),
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('/assets/generated/casino-hero.dim_1600x600.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          }}
        />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-primary/15 text-primary border-primary/30 text-sm px-4 py-1.5">
            🎰 Virtual Casino — No Real Money
          </Badge>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gold-gradient">Win Big.</span>
            <br />
            <span className="text-foreground">Play Smart.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The premier virtual gaming platform. Coin Flip, Dice, Roulette,
            Blackjack — and more coming soon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <Button
                size="lg"
                data-ocid="hero.register_button"
                onClick={() => setView("lobby")}
                className="bg-primary text-primary-foreground hover:opacity-90 font-bold text-lg px-8 h-14 casino-glow"
              >
                <Gamepad className="mr-2 w-5 h-5" /> Play Now
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  data-ocid="hero.register_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="bg-primary text-primary-foreground hover:opacity-90 font-bold text-lg px-8 h-14 casino-glow"
                >
                  <Trophy className="mr-2 w-5 h-5" />
                  {isLoggingIn
                    ? "Connecting..."
                    : "Register & Get 1,000 Credits"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  data-ocid="hero.login_button"
                  onClick={login}
                  disabled={isLoggingIn}
                  className="border-primary/30 text-primary hover:bg-primary/10 text-lg px-8 h-14"
                >
                  <LogIn className="mr-2 w-5 h-5" /> Login
                </Button>
              </>
            )}
          </div>

          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { label: "Active Players", value: "12,400+" },
              { label: "Credits Won", value: "4.2M" },
              { label: "Games Available", value: "4" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary font-display">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Winners Ticker */}
      <div className="bg-secondary/50 border-y border-border py-3 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="shrink-0 flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3 py-1 ml-4">
            <Star className="w-3 h-3 text-primary" />
            <span className="text-xs font-bold text-primary">WINNERS</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex gap-8 animate-ticker whitespace-nowrap">
              {tickerWinners.map((w) => (
                <span
                  key={w.tickerKey}
                  className="text-sm text-muted-foreground"
                >
                  <span className="text-primary font-semibold">{w.name}</span>{" "}
                  won{" "}
                  <span className="text-foreground font-bold">
                    {w.amount.toLocaleString()} credits
                  </span>{" "}
                  at {w.game}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Games */}
      <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl font-bold text-foreground mb-3">
            Featured Games
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose your game, place your bet, win credits
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_GAMES.map((game) => (
            <Card
              key={game.id}
              className={`casino-card group cursor-pointer transition-all duration-300 overflow-hidden ${
                game.disabled
                  ? "opacity-60"
                  : "casino-glow hover:-translate-y-1"
              }`}
              onClick={() =>
                !game.disabled && (isLoggedIn ? setView("lobby") : login())
              }
            >
              <CardContent className="p-0">
                <div
                  className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center text-6xl`}
                >
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
                  {!game.disabled && (
                    <div className="flex items-center text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                      Play Now <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-secondary/20 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Start playing in under a minute
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4 casino-glow">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl font-display font-bold text-primary/30 mb-2">
                  {step < 10 ? `0${step}` : step}
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promotions */}
      {(promotionsQuery.data?.length ?? 0) > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-foreground mb-3">
              Active Promotions
            </h2>
            <p className="text-muted-foreground text-lg">
              Exclusive bonuses for our players
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promotionsQuery.data?.map((promo) => (
              <Card
                key={promo.title}
                className="casino-card casino-glow overflow-hidden"
              >
                <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground">
                      {promo.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {promo.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-primary" />
                    <span className="text-primary font-bold">
                      {Number(promo.bonusAmount).toLocaleString()} Credits Bonus
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      {!isLoggedIn && (
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Ready to <span className="gold-gradient">Win Big?</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of players and claim your 1,000 free credits today.
            </p>
            <Button
              size="lg"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:opacity-90 font-bold text-lg px-10 h-14 casino-glow"
            >
              <Trophy className="mr-2 w-5 h-5" />
              {isLoggingIn ? "Connecting..." : "Start Playing Free"}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
