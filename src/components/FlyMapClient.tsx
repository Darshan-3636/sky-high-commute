import { lazy, Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { GeoPoint } from "@/lib/flycab";

const FlyMap = lazy(() =>
  import("./FlyMap").then((m) => ({ default: m.FlyMap })),
);

interface Props {
  start: GeoPoint | null;
  end: GeoPoint | null;
  onMapClick: (lat: number, lng: number) => void;
  flyTo?: { lat: number; lng: number } | null;
}

export function FlyMapClient(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface/40">
        <Loader2 className="h-6 w-6 animate-spin text-neon" />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-surface/40">
          <Loader2 className="h-6 w-6 animate-spin text-neon" />
        </div>
      }
    >
      <FlyMap {...props} />
    </Suspense>
  );
}
