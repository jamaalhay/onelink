import type { DeliveryZone } from "@/lib/types";

interface TrackingMapProps {
  zone: DeliveryZone;
}

// OpenStreetMap embedded iframe, centered on the zone's centroid. No JS deps,
// no API keys — good enough for a "here's where your order is heading"
// reassurance graphic. Replace with Leaflet/Mapbox once we have real rider
// coords streaming from the dispatch system.
export function TrackingMap({ zone }: TrackingMapProps) {
  const lat = zone.lat ?? 18.0098;
  const lng = zone.lng ?? -76.7894;
  // ~0.04° box ≈ 2 mi square, enough to show neighborhood context.
  const halfBox = 0.025;
  const bbox = `${lng - halfBox},${lat - halfBox},${lng + halfBox},${lat + halfBox}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-alt)] aspect-[16/7] relative">
      <iframe
        title={`${zone.name} delivery area`}
        src={src}
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="absolute bottom-2 right-2 bg-[var(--color-bg)]/90 backdrop-blur px-2.5 py-1 rounded-[var(--radius-button)] text-xs font-medium text-[var(--color-text)] border border-[var(--color-border)]">
        {zone.name}
      </div>
    </div>
  );
}
