import type { DeliveryZone } from "../types";

// Centroid coordinates for each Kingston neighborhood — used by the tracking
// page map and zone-change UI. Values are reasonable approximations from
// OpenStreetMap; not survey-accurate but good enough for a delivery preview.
export const zones: DeliveryZone[] = [
  { slug: "new-kingston",   name: "New Kingston",   feeJmd: 600,  etaMin: 15, etaMax: 30, band: "core",  lat: 18.0098, lng: -76.7894 },
  { slug: "half-way-tree",  name: "Half Way Tree",  feeJmd: 600,  etaMin: 15, etaMax: 30, band: "core",  lat: 18.0107, lng: -76.7972 },
  { slug: "liguanea",       name: "Liguanea",       feeJmd: 600,  etaMin: 15, etaMax: 30, band: "core",  lat: 18.0162, lng: -76.7758 },
  { slug: "barbican",       name: "Barbican",       feeJmd: 700,  etaMin: 20, etaMax: 35, band: "core",  lat: 18.0247, lng: -76.7706 },
  { slug: "cherry-gardens", name: "Cherry Gardens", feeJmd: 800,  etaMin: 25, etaMax: 40, band: "outer", lat: 18.0398, lng: -76.7822 },
  { slug: "stony-hill",     name: "Stony Hill",     feeJmd: 1000, etaMin: 30, etaMax: 45, band: "outer", lat: 18.0683, lng: -76.7625 },
  { slug: "constant-spring",name: "Constant Spring",feeJmd: 700,  etaMin: 20, etaMax: 35, band: "core",  lat: 18.0317, lng: -76.7989 },
  { slug: "papine",         name: "Papine",         feeJmd: 700,  etaMin: 20, etaMax: 35, band: "core",  lat: 18.0306, lng: -76.7414 },
  { slug: "harbour-view",   name: "Harbour View",   feeJmd: 1100, etaMin: 30, etaMax: 45, band: "outer", lat: 17.9519, lng: -76.7156 },
  { slug: "portmore",       name: "Portmore",       feeJmd: 1200, etaMin: 30, etaMax: 45, band: "outer", lat: 17.9550, lng: -76.8814 },
];

export const defaultZone = zones[0];

export const findZone = (slug: string): DeliveryZone | undefined =>
  zones.find((z) => z.slug === slug);

// Match a free-form zone label (Medusa shipping option name) back to a zone
// row, e.g. "New Kingston · Core" → newKingston entry.
export const findZoneByName = (name: string | undefined | null): DeliveryZone | undefined => {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  return zones.find((z) => lower.includes(z.name.toLowerCase()));
};
