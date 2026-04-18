import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plane, MapPin, Loader2, Trash2, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TIERS, type Tier } from "@/lib/flycab";
import { toast } from "sonner";

interface Trip {
  id: string;
  start_label: string;
  end_label: string;
  tier: Tier;
  distance_km: number;
  total_cost: number;
  eta_minutes: number;
  created_at: string;
}

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "My trips — FlyCab" },
      { name: "description", content: "Your flight history with FlyCab." },
    ],
  }),
  component: TripsPage,
});

function TripsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error("Failed to load trips");
      } else {
        setTrips(data as Trip[]);
      }
      setLoading(false);
    })();
  }, [user]);

  async function deleteTrip(id: string) {
    const prev = trips;
    setTrips(trips.filter((t) => t.id !== id));
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) {
      setTrips(prev);
      toast.error("Could not delete trip");
    } else {
      toast.success("Trip removed");
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              My <span className="text-neon text-glow">trips</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {trips.length === 0 && !loading
                ? "No flights yet."
                : `${trips.length} flight${trips.length === 1 ? "" : "s"} so far.`}
            </p>
          </div>
          <Button asChild className="bg-gradient-neon text-neon-foreground" style={{ boxShadow: "var(--shadow-glow)" }}>
            <Link to="/app">
              <Plane className="mr-1.5 h-4 w-4" /> Book new
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-neon" />
          </div>
        ) : trips.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Plane className="mx-auto h-12 w-12 text-neon" style={{ filter: "drop-shadow(0 0 12px var(--neon))" }} />
            <h3 className="mt-4 font-display text-xl font-semibold">Ready for takeoff?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Book your first flight and watch Bengaluru shrink beneath you.
            </p>
            <Button asChild className="mt-5 bg-gradient-neon text-neon-foreground">
              <Link to="/app">Book a flight</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {trips.map((t, i) => {
              const cfg = TIERS[t.tier];
              return (
                <motion.li
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className="rounded-full bg-neon/10 px-2.5 py-0.5 text-xs font-medium text-neon"
                          style={{ boxShadow: "inset 0 0 10px oklch(0.82 0.16 200 / 0.2)" }}
                        >
                          {cfg.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(t.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neon" />
                          <span className="line-clamp-1">{t.start_label}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-magenta" style={{ color: "var(--magenta)" }} />
                          <span className="line-clamp-1">{t.end_label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-3 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                      <div className="text-right">
                        <div className="font-mono text-xl font-bold text-neon">
                          ₹{Number(t.total_cost).toLocaleString("en-IN")}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {t.distance_km.toFixed(1)} km · {t.eta_minutes} min
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTrip(t.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete trip"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
