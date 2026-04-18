import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchBengaluru, type NominatimResult } from "@/lib/nominatim";
import type { GeoPoint } from "@/lib/flycab";

interface Props {
  label: string;
  placeholder: string;
  value: GeoPoint | null;
  onSelect: (point: GeoPoint) => void;
  accent: "neon" | "magenta";
}

export function LocationSearch({ label, placeholder, value, onSelect, accent }: Props) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<number | undefined>(undefined);

  useEffect(() => {
    setQuery(value?.label ?? "");
  }, [value]);

  function onChange(v: string) {
    setQuery(v);
    setOpen(true);
    if (debounce.current) window.clearTimeout(debounce.current);
    if (v.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounce.current = window.setTimeout(async () => {
      const r = await searchBengaluru(v);
      setResults(r);
      setLoading(false);
    }, 350);
  }

  function pick(r: NominatimResult) {
    const point: GeoPoint = {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      label: r.display_name.split(",").slice(0, 3).join(",").trim(),
    };
    onSelect(point);
    setQuery(point.label);
    setOpen(false);
  }

  const dotColor = accent === "neon" ? "bg-neon" : "bg-magenta";

  return (
    <div className="relative">
      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <span
          className={`inline-block h-2 w-2 rounded-full ${dotColor}`}
          style={{
            backgroundColor: accent === "neon" ? "var(--neon)" : "var(--magenta)",
            boxShadow: `0 0 10px ${accent === "neon" ? "var(--neon)" : "var(--magenta)"}`,
          }}
        />
        {label}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="h-11 rounded-xl border-border bg-input/60 pl-9 pr-9 font-mono text-sm placeholder:text-muted-foreground/60 focus-visible:ring-neon"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-neon" />
        )}
      </div>
      {open && results.length > 0 && (
        <div className="glass-strong absolute left-0 right-0 top-full z-[1000] mt-2 max-h-72 overflow-y-auto rounded-xl shadow-2xl">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                pick(r);
              }}
              className="flex w-full items-start gap-2 border-b border-border/40 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/50 last:border-b-0"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neon" />
              <span className="line-clamp-2 leading-tight">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
