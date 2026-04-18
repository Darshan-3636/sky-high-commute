import { motion } from "framer-motion";
import { Zap, Crown, Sparkles, Users, Clock } from "lucide-react";
import { TIERS, type Tier, etaFor, priceFor } from "@/lib/flycab";
import { cn } from "@/lib/utils";

const ICONS: Record<Tier, typeof Zap> = {
  eco: Zap,
  business: Sparkles,
  first: Crown,
};

interface Props {
  km: number | null;
  selected: Tier;
  onSelect: (t: Tier) => void;
}

export function TierPicker({ km, selected, onSelect }: Props) {
  const tiers: Tier[] = ["eco", "business", "first"];
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Select tier
      </div>
      <div className="grid gap-2">
        {tiers.map((t) => {
          const cfg = TIERS[t];
          const Icon = ICONS[t];
          const isSelected = selected === t;
          const price = km != null ? priceFor(t, km) : null;
          const eta = km != null ? etaFor(t, km) : null;
          return (
            <motion.button
              key={t}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(t)}
              className={cn(
                "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-all",
                isSelected
                  ? "border-neon bg-neon/5 shadow-[0_0_25px_oklch(0.82_0.16_200/0.25)]"
                  : "border-border/60 bg-surface/40 hover:border-neon/40 hover:bg-surface/70",
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all",
                  isSelected ? "bg-neon text-neon-foreground" : "bg-surface-elevated text-neon",
                )}
                style={isSelected ? { boxShadow: "var(--shadow-glow)" } : undefined}
              >
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="truncate font-display text-base font-semibold">{cfg.name}</h4>
                  {price != null && (
                    <span className="font-mono text-base font-bold text-neon">
                      ₹{price.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{cfg.tagline}</span>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    {eta != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {eta}m
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {cfg.capacity}
                    </span>
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-neon/5 to-transparent" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
