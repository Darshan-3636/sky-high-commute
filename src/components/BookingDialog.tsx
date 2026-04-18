import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, CheckCircle2, Loader2, PlaneLanding, Radio } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TIERS, etaFor, priceFor, type Tier, type GeoPoint } from "@/lib/flycab";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type Phase = "confirm" | "dispatching" | "arriving" | "boarding" | "in_flight" | "landed";

interface Props {
  open: boolean;
  onClose: () => void;
  start: GeoPoint;
  end: GeoPoint;
  tier: Tier;
  km: number;
  onCompleted: () => void;
}

const STAGES: { id: Phase; label: string; icon: typeof Radio }[] = [
  { id: "dispatching", label: "Dispatching pod", icon: Radio },
  { id: "arriving", label: "Pod arriving", icon: Plane },
  { id: "boarding", label: "Boarding", icon: CheckCircle2 },
  { id: "in_flight", label: "In flight", icon: Plane },
  { id: "landed", label: "Landed", icon: PlaneLanding },
];

export function BookingDialog({ open, onClose, start, end, tier, km, onCompleted }: Props) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("confirm");
  const [saving, setSaving] = useState(false);
  const cfg = TIERS[tier];
  const price = priceFor(tier, km);
  const eta = etaFor(tier, km);

  useEffect(() => {
    if (open) setPhase("confirm");
  }, [open]);

  async function confirm() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("trips").insert({
        user_id: user.id,
        start_label: start.label,
        end_label: end.label,
        start_lat: start.lat,
        start_lng: start.lng,
        end_lat: end.lat,
        end_lng: end.lng,
        tier,
        distance_km: Number(km.toFixed(2)),
        total_cost: price,
        eta_minutes: eta,
        status: "completed",
      });
      if (error) throw error;
      onCompleted();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save trip");
      setSaving(false);
      return;
    }
    setSaving(false);

    // Run simulated stages
    const sequence: Phase[] = ["dispatching", "arriving", "boarding", "in_flight", "landed"];
    for (const s of sequence) {
      setPhase(s);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, s === "in_flight" ? 1800 : 1100));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && phase !== "confirm" && phase !== "landed" ? null : !v && onClose()}>
      <DialogContent className="glass-strong max-w-md border-neon/30 p-0 sm:rounded-2xl" showCloseButton={phase === "confirm" || phase === "landed"}>
        <AnimatePresence mode="wait">
          {phase === "confirm" ? (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="mb-1 text-xs font-medium uppercase tracking-widest text-neon">
                Confirm flight
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight">{cfg.name}</h2>

              <div className="mt-5 space-y-3 rounded-xl bg-surface/60 p-4">
                <Row label="From" value={start.label} />
                <Row label="To" value={end.label} />
                <div className="grid grid-cols-3 gap-3 border-t border-border/40 pt-3">
                  <Stat label="Distance" value={`${km.toFixed(1)} km`} />
                  <Stat label="ETA" value={`${eta} min`} />
                  <Stat label="Total" value={`₹${price.toLocaleString("en-IN")}`} highlight />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-neon font-semibold text-neon-foreground hover:opacity-90"
                  style={{ boxShadow: "var(--shadow-glow)" }}
                  onClick={confirm}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Flight"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6"
            >
              <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-neon">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neon" />
                </span>
                Live status
              </div>
              <ol className="space-y-3">
                {STAGES.map((s, i) => {
                  const currentIndex = STAGES.findIndex((x) => x.id === phase);
                  const isDone = i < currentIndex;
                  const isCurrent = i === currentIndex;
                  const Icon = s.icon;
                  return (
                    <li key={s.id} className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
                          isDone
                            ? "bg-neon/20 text-neon"
                            : isCurrent
                            ? "bg-neon text-neon-foreground animate-pulse-neon"
                            : "bg-surface text-muted-foreground"
                        }`}
                      >
                        {isCurrent ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isDone ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <span
                        className={`font-display ${
                          isCurrent ? "text-foreground font-semibold" : isDone ? "text-muted-foreground line-through" : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
              {phase === "landed" && (
                <Button
                  className="mt-6 w-full bg-gradient-neon text-neon-foreground"
                  onClick={onClose}
                >
                  Done
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="w-12 shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="line-clamp-2 leading-snug">{value}</span>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-lg font-bold ${highlight ? "text-neon text-glow" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
