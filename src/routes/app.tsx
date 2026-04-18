import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPinned, ArrowDownUp, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { FlyMapClient as FlyMap } from "@/components/FlyMapClient";
import { LocationSearch } from "@/components/LocationSearch";
import { TierPicker } from "@/components/TierPicker";
import { BookingDialog } from "@/components/BookingDialog";
import { Button } from "@/components/ui/button";
import { haversineKm, priceFor, etaFor, type Tier, type GeoPoint } from "@/lib/flycab";
import { reverseGeocode } from "@/lib/nominatim";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Book a flight — FlyCab" },
      { name: "description", content: "Pick your route across Bengaluru and book a flying taxi." },
    ],
  }),
  component: AppPage,
});

function AppPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [start, setStart] = useState<GeoPoint | null>(null);
  const [end, setEnd] = useState<GeoPoint | null>(null);
  const [tier, setTier] = useState<Tier>("eco");
  const [picking, setPicking] = useState<"start" | "end">("start");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<GeoPoint | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const km = useMemo(
    () => (start && end ? haversineKm(start, end) : null),
    [start, end],
  );

  async function onMapClick(lat: number, lng: number) {
    const label = await reverseGeocode(lat, lng);
    const point: GeoPoint = { lat, lng, label };
    if (picking === "start") {
      setStart(point);
      if (!end) setPicking("end");
    } else {
      setEnd(point);
    }
  }

  function swap() {
    setStart(end);
    setEnd(start);
  }

  function handleSelectStart(p: GeoPoint) {
    setStart(p);
    setFlyTo(p);
  }
  function handleSelectEnd(p: GeoPoint) {
    setEnd(p);
    setFlyTo(p);
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <div className="relative flex flex-1 flex-col lg:flex-row">
        {/* Map area */}
        <div className="relative h-[55vh] flex-1 lg:h-auto">
          <FlyMap start={start} end={end} onMapClick={onMapClick} flyTo={flyTo} />

          {/* Picking hint */}
          <div className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2">
            <div className="glass-strong flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium">
              <MapPinned className="h-3.5 w-3.5 text-neon" />
              Tap map to set{" "}
              <span className="text-neon">{picking === "start" ? "pickup" : "drop-off"}</span>
            </div>
          </div>

          {/* Toggle picking mode */}
          <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2">
            <div className="glass-strong flex rounded-full p-1 text-xs font-medium">
              {(["start", "end"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPicking(m)}
                  className={`rounded-full px-3 py-1.5 transition-colors ${
                    picking === m
                      ? "bg-neon text-neon-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "start" ? "Set pickup" : "Set drop-off"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong relative z-10 w-full border-t border-border/40 lg:w-[400px] lg:border-l lg:border-t-0"
        >
          <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
            <div className="space-y-3">
              <LocationSearch
                label="Pickup"
                placeholder="Indiranagar, Koramangala…"
                value={start}
                accent="neon"
                onSelect={handleSelectStart}
              />
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={swap}
                  disabled={!start || !end}
                  className="rounded-full border border-border bg-surface p-1.5 text-muted-foreground transition-all hover:border-neon hover:text-neon disabled:opacity-40"
                  aria-label="Swap"
                >
                  <ArrowDownUp className="h-3.5 w-3.5" />
                </button>
              </div>
              <LocationSearch
                label="Drop-off"
                placeholder="Whitefield, BLR Airport…"
                value={end}
                accent="magenta"
                onSelect={handleSelectEnd}
              />
            </div>

            {km != null && (
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface/60 p-3 text-center">
                <Stat label="Distance" value={`${km.toFixed(1)}km`} />
                <Stat label="ETA" value={`${etaFor(tier, km)}m`} />
                <Stat label="Price" value={`₹${priceFor(tier, km).toLocaleString("en-IN")}`} highlight />
              </div>
            )}

            <TierPicker km={km} selected={tier} onSelect={setTier} />

            <div className="mt-auto pt-2">
              <Button
                disabled={!start || !end}
                onClick={() => {
                  if (!start || !end) {
                    toast.error("Set both pickup and drop-off");
                    return;
                  }
                  setBookingOpen(true);
                }}
                className="h-12 w-full bg-gradient-neon text-base font-semibold text-neon-foreground hover:opacity-90 disabled:opacity-50"
                style={{ boxShadow: "var(--shadow-glow)" }}
              >
                {start && end ? "Book Now" : "Select pickup & drop-off"}
              </Button>
            </div>
          </div>
        </motion.aside>
      </div>

      {start && end && km != null && (
        <BookingDialog
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
          start={start}
          end={end}
          tier={tier}
          km={km}
          onCompleted={() => {
            // Could refresh trips list - landing page navigates after dialog close
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className={`font-mono text-base font-bold ${highlight ? "text-neon text-glow" : ""}`}>
        {value}
      </div>
    </div>
  );
}
