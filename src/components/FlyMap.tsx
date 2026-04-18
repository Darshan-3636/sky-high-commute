import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BENGALURU_CENTER, arcPath, type GeoPoint } from "@/lib/flycab";

// Fix default marker icons (we use custom DivIcons)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

function makePinIcon(color: string, label: string) {
  return L.divIcon({
    className: "flycab-pin",
    html: `
      <div style="position:relative;width:36px;height:48px;transform:translate(-50%,-100%);">
        <svg viewBox="0 0 36 48" width="36" height="48" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="g${label}" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <path filter="url(#g${label})" d="M18 2 C8 2 2 9 2 18 c0 11 16 28 16 28 s16-17 16-28 c0-9-6-16-16-16 z" fill="${color}" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
          <circle cx="18" cy="18" r="6" fill="#0b0d18"/>
          <text x="18" y="22" text-anchor="middle" font-family="Space Grotesk, sans-serif" font-size="10" font-weight="700" fill="${color}">${label}</text>
        </svg>
      </div>
    `,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
  });
}

interface Props {
  start: GeoPoint | null;
  end: GeoPoint | null;
  onMapClick: (lat: number, lng: number) => void;
  flyTo?: { lat: number; lng: number } | null;
}

export function FlyMap({ start, end, onMapClick, flyTo }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const arcLayerRef = useRef<L.LayerGroup | null>(null);
  const onMapClickRef = useRef(onMapClick);

  // Keep latest click handler without re-initing the map
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // Initialize the map ONCE
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: BENGALURU_CENTER,
      zoom: 12,
      minZoom: 10,
      maxZoom: 18,
      zoomControl: true,
      worldCopyJump: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://osm.org">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e: L.LeafletMouseEvent) => {
      onMapClickRef.current(e.latlng.lat, e.latlng.lng);
    });

    arcLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Ensure proper sizing after mount
    setTimeout(() => map.invalidateSize(), 0);

    return () => {
      map.remove();
      mapRef.current = null;
      startMarkerRef.current = null;
      endMarkerRef.current = null;
      arcLayerRef.current = null;
    };
  }, []);

  // Start marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    if (start) {
      startMarkerRef.current = L.marker([start.lat, start.lng], {
        icon: makePinIcon("oklch(0.82 0.16 200)", "A"),
      }).addTo(map);
    }
  }, [start]);

  // End marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (endMarkerRef.current) {
      map.removeLayer(endMarkerRef.current);
      endMarkerRef.current = null;
    }
    if (end) {
      endMarkerRef.current = L.marker([end.lat, end.lng], {
        icon: makePinIcon("oklch(0.70 0.25 330)", "B"),
      }).addTo(map);
    }
  }, [end]);

  // Arc path + fit bounds
  useEffect(() => {
    const map = mapRef.current;
    const layer = arcLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (start && end) {
      const arc = arcPath(start, end);
      L.polyline(arc, {
        color: "oklch(0.82 0.16 200)",
        weight: 14,
        opacity: 0.15,
      }).addTo(layer);
      L.polyline(arc, {
        color: "oklch(0.82 0.16 200)",
        weight: 4,
        opacity: 0.9,
        dashArray: "6 8",
      }).addTo(layer);
      const bounds = L.latLngBounds(
        [start.lat, start.lng],
        [end.lat, end.lng],
      ).pad(0.3);
      map.fitBounds(bounds, { animate: true, duration: 1 });
    }
  }, [start, end]);

  // Fly to selected location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTo) return;
    map.flyTo([flyTo.lat, flyTo.lng], 14, { duration: 1.2 });
  }, [flyTo]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}
