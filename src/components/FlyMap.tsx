import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from "react-leaflet";
import { BENGALURU_CENTER, arcPath, type GeoPoint } from "@/lib/flycab";

// Fix default marker icons (we'll use custom DivIcons instead)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

function makePinIcon(color: string, label: string) {
  return L.divIcon({
    className: "flycab-pin",
    html: `
      <div style="position:relative;width:36px;height:48px;transform:translate(-50%,-100%);">
        <div style="position:absolute;inset:0;display:flex;align-items:flex-start;justify-content:center;">
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

function ClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ target }: { target?: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], 14, { duration: 1.2 });
  }, [target, map]);
  return null;
}

function FitBounds({ start, end }: { start: GeoPoint | null; end: GeoPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (start && end) {
      const b = L.latLngBounds([start.lat, start.lng], [end.lat, end.lng]).pad(0.3);
      map.fitBounds(b, { duration: 1, animate: true });
    }
  }, [start, end, map]);
  return null;
}

export function FlyMap({ start, end, onMapClick, flyTo }: Props) {
  const startIcon = useMemo(() => makePinIcon("oklch(0.82 0.16 200)", "A"), []);
  const endIcon = useMemo(() => makePinIcon("oklch(0.70 0.25 330)", "B"), []);

  const arc = useMemo(
    () => (start && end ? arcPath(start, end) : []),
    [start, end],
  );

  const mapRef = useRef<L.Map | null>(null);

  return (
    <MapContainer
      ref={mapRef}
      center={BENGALURU_CENTER}
      zoom={12}
      minZoom={10}
      maxZoom={18}
      zoomControl={true}
      style={{ width: "100%", height: "100%" }}
      worldCopyJump={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onMapClick={onMapClick} />
      <FlyTo target={flyTo} />
      <FitBounds start={start} end={end} />
      {start && (
        <Marker position={[start.lat, start.lng]} icon={startIcon} />
      )}
      {end && <Marker position={[end.lat, end.lng]} icon={endIcon} />}
      {arc.length > 0 && (
        <>
          <Polyline
            positions={arc}
            pathOptions={{
              color: "oklch(0.82 0.16 200)",
              weight: 4,
              opacity: 0.9,
              dashArray: "6 8",
            }}
          />
          <Polyline
            positions={arc}
            pathOptions={{
              color: "oklch(0.82 0.16 200)",
              weight: 14,
              opacity: 0.15,
            }}
          />
        </>
      )}
    </MapContainer>
  );
}
