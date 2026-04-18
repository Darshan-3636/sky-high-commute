// Lightweight Nominatim search restricted to Bengaluru area.
// Free OSM service - be polite (no spam).

const BLR_VIEWBOX = "77.40,13.20,77.85,12.75"; // lon_min,lat_max,lon_max,lat_min

export interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

export async function searchBengaluru(query: string): Promise<NominatimResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", `${q}, Bengaluru`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "6");
  url.searchParams.set("viewbox", BLR_VIEWBOX);
  url.searchParams.set("bounded", "1");
  url.searchParams.set("countrycodes", "in");

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("format", "json");
    url.searchParams.set("zoom", "16");
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const j = (await res.json()) as { display_name?: string };
    return j.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}
