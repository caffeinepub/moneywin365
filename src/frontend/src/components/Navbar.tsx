import { Button } from "@/components/ui/button";
import {
  Coins,
  Gamepad2,
  LayoutDashboard,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import type { View } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavbarProps {
  view: View;
  setView: (v: View) => void;
  balance: bigint;
  username?: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  onAdminClick?: () => void;
}

export default function Navbar({
  view,
  setView,
  balance,
  username,
  isAdmin,
  isLoggedIn,
  onAdminClick,
}: NavbarProps) {
  const { login, clear, isLoggingIn } = useInternetIdentity();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          type="button"
          onClick={() => setView("landing")}
          className="flex items-center group"
          data-ocid="nav.link"
        >
          <img
            src="/assets/generated/moneywin365-logo-transparent.dim_600x200.png"
            alt="Moneywin365"
            style={{ height: 44, objectFit: "contain" }}
          />
        </button>

        {/* Nav links */}
        {isLoggedIn && (
          <nav className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              data-ocid="nav.lobby_link"
              onClick={() => setView("lobby")}
              className={`gap-1.5 ${view === "lobby" ? "text-primary" : "text-muted-foreground"}`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Games</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-ocid="nav.dashboard_link"
              onClick={() => setView("dashboard")}
              className={`gap-1.5 ${view === "dashboard" ? "text-primary" : "text-muted-foreground"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                data-ocid="nav.admin_link"
                onClick={onAdminClick ?? (() => setView("admin"))}
                className={`gap-1.5 ${view === "admin" ? "text-primary" : "text-muted-foreground"}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 bg-secondary/50 border border-border rounded-full px-3 py-1.5">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {Number(balance).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">Credits</span>
              </div>
              {username && (
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {username}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                data-ocid="nav.logout_button"
                onClick={clear}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              data-ocid="nav.login_button"
              onClick={login}
              disabled={isLoggingIn}
              className="bg-primary text-primary-foreground hover:opacity-90 font-semibold gap-1.5"
            >
              <LogIn className="w-4 h-4" />
              {isLoggingIn ? "Connecting..." : "Login"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
