import type { DeliveryZone } from "../types";

export const zones: DeliveryZone[] = [
  { slug: "new-kingston", name: "New Kingston", feeJmd: 600, etaMin: 15, etaMax: 30, band: "core" },
  { slug: "half-way-tree", name: "Half Way Tree", feeJmd: 600, etaMin: 15, etaMax: 30, band: "core" },
  { slug: "liguanea", name: "Liguanea", feeJmd: 600, etaMin: 15, etaMax: 30, band: "core" },
  { slug: "barbican", name: "Barbican", feeJmd: 700, etaMin: 20, etaMax: 35, band: "core" },
  { slug: "cherry-gardens", name: "Cherry Gardens", feeJmd: 800, etaMin: 25, etaMax: 40, band: "outer" },
  { slug: "stony-hill", name: "Stony Hill", feeJmd: 1000, etaMin: 30, etaMax: 45, band: "outer" },
  { slug: "constant-spring", name: "Constant Spring", feeJmd: 700, etaMin: 20, etaMax: 35, band: "core" },
  { slug: "papine", name: "Papine", feeJmd: 700, etaMin: 20, etaMax: 35, band: "core" },
  { slug: "harbour-view", name: "Harbour View", feeJmd: 1100, etaMin: 30, etaMax: 45, band: "outer" },
  { slug: "portmore", name: "Portmore", feeJmd: 1200, etaMin: 30, etaMax: 45, band: "outer" },
];

export const defaultZone = zones[0];

export const findZone = (slug: string): DeliveryZone | undefined =>
  zones.find((z) => z.slug === slug);
