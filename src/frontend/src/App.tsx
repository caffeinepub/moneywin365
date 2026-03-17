import { Toaster } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import RegisterModal from "./components/RegisterModal";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import GameLobby from "./pages/GameLobby";
import LandingPage from "./pages/LandingPage";

export type View = "landing" | "lobby" | "dashboard" | "admin";

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [showRegister, setShowRegister] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const balanceQuery = useQuery({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const adminQuery = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const registerMutation = useMutation({
    mutationFn: async ({ username }: { username: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.registerUser(username);
      await actor.deposit(1000n);
    },
    onSuccess: () => {
      setShowRegister(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });

  // Reset admin unlock on logout
  useEffect(() => {
    if (!identity) {
      setShowRegister(false);
      setAdminUnlocked(false);
      return;
    }
    if (profileQuery.data === null && !profileQuery.isLoading) {
      setShowRegister(true);
    } else if (profileQuery.data) {
      setShowRegister(false);
    }
  }, [identity, profileQuery.data, profileQuery.isLoading]);

  const handleRegister = useCallback(
    (username: string) => {
      registerMutation.mutate({ username });
    },
    [registerMutation],
  );

  const handleAdminClick = useCallback(() => {
    setView("admin");
  }, []);

  const handleAdminCodeSuccess = useCallback(() => {
    setAdminUnlocked(true);
  }, []);

  const balance = balanceQuery.data ?? 0n;
  const isAdmin = adminQuery.data ?? false;
  const username = profileQuery.data?.username;

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <div className="min-h-screen bg-background noise-bg">
      {view !== "admin" && (
        <Navbar
          view={view}
          setView={setView}
          balance={balance}
          username={username}
          isAdmin={isAdmin}
          isLoggedIn={!!identity}
          onAdminClick={handleAdminClick}
        />
      )}
      <main>
        {view === "landing" && (
          <LandingPage setView={setView} isLoggedIn={!!identity} />
        )}
        {view === "lobby" && (
          <GameLobby
            actor={actor}
            onBalanceRefresh={() =>
              queryClient.invalidateQueries({ queryKey: ["balance"] })
            }
          />
        )}
        {view === "dashboard" && (
          <Dashboard
            actor={actor}
            isFetching={isFetching}
            onRefresh={() => {
              queryClient.invalidateQueries({ queryKey: ["balance"] });
              queryClient.invalidateQueries({ queryKey: ["profile"] });
            }}
          />
        )}
        {view === "admin" && !adminUnlocked && (
          <AdminLoginPage
            onSuccess={handleAdminCodeSuccess}
            onBack={() => setView("landing")}
          />
        )}
        {view === "admin" && isAdmin && adminUnlocked && (
          <AdminPanel actor={actor} />
        )}
      </main>

      {view !== "admin" && (
        <footer className="border-t border-border mt-16 py-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground text-sm">
            <div className="flex gap-6">
              <span className="cursor-default hover:text-primary transition-colors">
                About
              </span>
              <span className="cursor-default hover:text-primary transition-colors">
                Terms
              </span>
              <span className="cursor-default hover:text-primary transition-colors">
                Responsible Gaming
              </span>
              <span className="cursor-default hover:text-primary transition-colors">
                Support
              </span>
            </div>
            <p>
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      )}

      <RegisterModal
        open={showRegister}
        onRegister={handleRegister}
        isLoading={registerMutation.isPending}
      />

      <Toaster />
    </div>
  );
}
