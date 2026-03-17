import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const ADMIN_CODE = "9721834860";

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLoginPage({
  onSuccess,
  onBack,
}: AdminLoginPageProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ADMIN_CODE) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-2xl"
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-1 tracking-tight">
            Admin Login
          </h1>
          <p className="text-sm text-center text-muted-foreground mb-8">
            Moneywin365 Admin Portal
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                data-ocid="admin_login.input"
                type="password"
                inputMode="numeric"
                placeholder="Enter security code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                className={`text-center tracking-widest text-lg ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
                autoFocus
              />
              {error && (
                <p
                  data-ocid="admin_login.error_state"
                  className="text-destructive text-sm text-center"
                >
                  Invalid security code. Please try again.
                </p>
              )}
            </div>

            <Button
              data-ocid="admin_login.submit_button"
              type="submit"
              className="w-full"
              disabled={!code.trim()}
            >
              Login
            </Button>
          </form>

          {/* Back */}
          <div className="mt-6 text-center">
            <button
              data-ocid="admin_login.back_button"
              type="button"
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
