import type { Category } from "../types";

const ph = (_label: string, _fg?: string, _bg?: string) => "/placeholder-product.svg";

export const categories: Category[] = [
  {
    slug: "vapes",
    name: "Vapes",
    shortLabel: "Vapes",
    description: "Premium disposables and pod systems.",
    imageUrl: ph("Vape"),
    ageRestricted: true,
  },
  {
    slug: "zyn-pouches",
    name: "ZYN Pouches",
    shortLabel: "ZYN",
    description: "Nicotine pouches in every strength.",
    imageUrl: ph("ZYN"),
    ageRestricted: true,
  },
  {
    slug: "lighters",
    name: "Lighters",
    shortLabel: "Lighters",
    description: "Bic, Clipper, refillables, torches.",
    imageUrl: ph("Lighter"),
    ageRestricted: false,
  },
  {
    slug: "smoking-accessories",
    name: "Smoking Accessories",
    shortLabel: "Accessories",
    description: "Trays, grinders, tools, and cases.",
    imageUrl: ph("Accessories"),
    ageRestricted: false,
  },
  {
    slug: "drinks",
    name: "Drinks",
    shortLabel: "Drinks",
    description: "Soft drinks, juices, energy.",
    imageUrl: ph("Drinks"),
    ageRestricted: false,
  },
  {
    slug: "snacks",
    name: "Snacks",
    shortLabel: "Snacks",
    description: "Chips, sweets, late-night fuel.",
    imageUrl: ph("Snacks"),
    ageRestricted: false,
  },
  {
    slug: "rolling-papers",
    name: "Rolling Papers",
    shortLabel: "Papers",
    description: "RAW, OCB, Zig-Zag and more.",
    imageUrl: ph("Papers"),
    ageRestricted: true,
  },
];

export const findCategory = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);
