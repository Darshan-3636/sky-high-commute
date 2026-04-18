export type Tier = "eco" | "business" | "first";

export interface TierConfig {
  id: Tier;
  name: string;
  tagline: string;
  baseFare: number;
  perKm: number;
  speedKmh: number; // for ETA
  capacity: number;
  accent: string;
}

export const TIERS: Record<Tier, TierConfig> = {
  eco: {
    id: "eco",
    name: "FlyCab Eco",
    tagline: "Standard autonomous pod",
    baseFare: 199,
    perKm: 35,
    speedKmh: 180,
    capacity: 2,
    accent: "var(--neon)",
  },
  business: {
    id: "business",
    name: "FlyCab Business",
    tagline: "Quiet cabin, premium comfort",
    baseFare: 399,
    perKm: 75,
    speedKmh: 240,
    capacity: 3,
    accent: "var(--magenta)",
  },
  first: {
    id: "first",
    name: "FlyCab First",
    tagline: "Luxury suite, supersonic",
    baseFare: 899,
    perKm: 160,
    speedKmh: 320,
    capacity: 4,
    accent: "var(--chart-3)",
  },
};

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function priceFor(tier: Tier, km: number): number {
  const cfg = TIERS[tier];
  return Math.round(cfg.baseFare + km * cfg.perKm);
}

export function etaFor(tier: Tier, km: number): number {
  const cfg = TIERS[tier];
  // 2 min boarding/landing buffer
  return Math.max(2, Math.round((km / cfg.speedKmh) * 60) + 2);
}

export const BENGALURU_CENTER: [number, number] = [12.9716, 77.5946];

export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

// Build a great-circle-ish arc between two points (parabolic in screen-space)
export function arcPath(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
  segments = 60,
): [number, number][] {
  const points: [number, number][] = [];
  const midLat = (a.lat + b.lat) / 2;
  const midLng = (a.lng + b.lng) / 2;
  const dLat = b.lat - a.lat;
  const dLng = b.lng - a.lng;
  const dist = Math.sqrt(dLat * dLat + dLng * dLng);
  // perpendicular offset for the arc apex
  const perpLat = -dLng;
  const perpLng = dLat;
  const norm = Math.sqrt(perpLat * perpLat + perpLng * perpLng) || 1;
  const apexHeight = dist * 0.18;
  const apexLat = midLat + (perpLat / norm) * apexHeight;
  const apexLng = midLng + (perpLng / norm) * apexHeight;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const u = 1 - t;
    // quadratic Bezier
    const lat = u * u * a.lat + 2 * u * t * apexLat + t * t * b.lat;
    const lng = u * u * a.lng + 2 * u * t * apexLng + t * t * b.lng;
    points.push([lat, lng]);
  }
  return points;
}
