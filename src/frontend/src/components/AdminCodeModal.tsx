import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ShieldX } from "lucide-react";
import { useState } from "react";

const ADMIN_CODE = "9721834860";

interface AdminCodeModalProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminCodeModal({
  open,
  onSuccess,
  onCancel,
}: AdminCodeModalProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setCode("");
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCode("");
      setError(false);
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-sm border-border bg-card"
        data-ocid="admin_code.dialog"
      >
        <DialogHeader className="items-center text-center">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-colors ${
              error
                ? "bg-destructive/20 border border-destructive/40"
                : "bg-primary/20 border border-primary/40"
            }`}
          >
            {error ? (
              <ShieldX className="w-7 h-7 text-destructive" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-primary" />
            )}
          </div>
          <DialogTitle className="font-display text-xl">
            Admin Access
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your security code to unlock the admin panel.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="admin-code" className="text-sm font-medium">
              Security Code
            </Label>
            <Input
              id="admin-code"
              type="password"
              inputMode="numeric"
              placeholder="Enter security code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(false);
              }}
              data-ocid="admin_code.input"
              className={`text-center tracking-widest text-lg font-mono transition-all ${
                shake ? "animate-[shake_0.4s_ease-in-out]" : ""
              } ${
                error
                  ? "border-destructive ring-1 ring-destructive focus-visible:ring-destructive"
                  : ""
              }`}
              autoFocus
              autoComplete="off"
            />
            {error && (
              <p
                className="text-destructive text-sm flex items-center gap-1.5"
                data-ocid="admin_code.error_state"
              >
                <ShieldX className="w-3.5 h-3.5" />
                Invalid security code
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              data-ocid="admin_code.cancel_button"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="admin_code.submit_button"
              className="flex-1 bg-primary text-primary-foreground hover:opacity-90 font-semibold"
            >
              Unlock Admin
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
