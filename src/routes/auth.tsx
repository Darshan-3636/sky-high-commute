import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Plane, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface AuthSearch {
  mode?: "signin" | "signup";
}

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    mode: search.mode === "signup" ? "signup" : "signin",
  }),
  head: () => ({
    meta: [
      { title: "Sign in to FlyCab" },
      { name: "description", content: "Sign in or create an account to book flying taxis in Bengaluru." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [loading, user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, displayName || email.split("@")[0]);
        toast.success("Account created. Welcome aboard.");
      } else {
        await signIn(email, password);
        toast.success("Signed in");
      }
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <Link
        to="/"
        className="absolute left-4 top-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong relative z-10 w-full max-w-md rounded-2xl p-7"
      >
        <div className="mb-6 flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-neon"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            <Plane className="h-5 w-5 text-neon-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Fly<span className="text-neon text-glow">Cab</span>
          </span>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight">
          {mode === "signin" ? "Welcome back, pilot." : "Create your FlyCab account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to book your next flight."
            : "Takes 10 seconds. No credit card required."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Arjun"
                className="h-11 bg-input/60"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 bg-input/60"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 bg-input/60"
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="h-11 w-full bg-gradient-neon font-semibold text-neon-foreground hover:opacity-90"
            style={{ boxShadow: "var(--shadow-glow)" }}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-muted-foreground transition-colors hover:text-neon"
        >
          {mode === "signin"
            ? "New here? Create an account →"
            : "Already a pilot? Sign in →"}
        </button>
      </motion.div>
    </div>
  );
}
