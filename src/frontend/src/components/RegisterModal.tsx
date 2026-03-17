import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Trophy } from "lucide-react";
import { useState } from "react";

interface RegisterModalProps {
  open: boolean;
  onRegister: (username: string) => void;
  isLoading: boolean;
}

export default function RegisterModal({
  open,
  onRegister,
  isLoading,
}: RegisterModalProps) {
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length >= 3) {
      onRegister(username.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="casino-card border-primary/20 max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="font-display text-2xl text-center text-foreground">
            Welcome to Moneywin365!
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Choose your player name to get started. You'll receive{" "}
            <span className="text-primary font-semibold">
              1,000 free credits
            </span>{" "}
            as a welcome bonus!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">
              Player Name
            </Label>
            <Input
              id="username"
              data-ocid="auth.username_input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your player name..."
              className="bg-input border-border"
              minLength={3}
              maxLength={20}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              3–20 characters, visible to other players.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-lg p-3">
            <Gift className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm text-foreground">
              🎉 You'll receive{" "}
              <strong className="text-primary">1,000 credits</strong> instantly
              upon registration!
            </p>
          </div>

          <Button
            type="submit"
            data-ocid="auth.register_submit_button"
            disabled={isLoading || username.trim().length < 3}
            className="w-full bg-primary text-primary-foreground font-semibold hover:opacity-90"
          >
            {isLoading ? "Creating Account..." : "Create Account & Claim Bonus"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
