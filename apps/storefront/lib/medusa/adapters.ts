/**
 * Adapters between Medusa v2 entities and Onelink UI prop types.
 * Lets UI components stay framework-agnostic while we swap mock data for live data.
 */
import type {
  Category,
  CategorySlug,
  Product,
  ProductBadge,
  ProductVariant,
} from "@/lib/types";

const PLACEHOLDER_IMG = "/placeholder-product.svg";

const KNOWN_CATEGORY_SLUGS: ReadonlyArray<CategorySlug> = [
  "vapes",
  "zyn-pouches",
  "lighters",
  "smoking-accessories",
  "drinks",
  "snacks",
  "rolling-papers",
];

interface MedusaImage {
  url?: string | null;
}

interface MedusaPrice {
  amount?: number | null;
  currency_code?: string | null;
}

interface MedusaVariant {
  id: string;
  title?: string | null;
  sku?: string | null;
  manage_inventory?: boolean | null;
  inventory_quantity?: number | null;
  calculated_price?: { calculated_amount?: number | null } | null;
  prices?: MedusaPrice[] | null;
}

interface MedusaCategory {
  id: string;
  handle?: string | null;
  name: string;
  description?: string | null;
}

interface MedusaProduct {
  id: string;
  handle?: string | null;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  images?: MedusaImage[] | null;
  status?: string | null;
  variants?: MedusaVariant[] | null;
  categories?: MedusaCategory[] | null;
  metadata?: Record<string, unknown> | null;
  tags?: { value: string }[] | null;
  options?: { id: string; title: string; values?: { value: string }[] | null }[] | null;
}

/**
 * Map a Medusa category handle to a known Onelink category slug, or null when
 * the handle is unknown. Caller handles the unknown case explicitly — we never
 * silently misclassify (which could leak age-restricted items past category
 * gates, hide search hits, etc.).
 */
const slugToCategory = (slug: string | null | undefined): CategorySlug | null =>
  KNOWN_CATEGORY_SLUGS.includes(slug as CategorySlug) ? (slug as CategorySlug) : null;

const ageRestricted = (slug: CategorySlug): boolean =>
  slug === "vapes" || slug === "zyn-pouches" || slug === "rolling-papers";

const inferBrand = (title: string): string => {
  // Extract brand from titles like "Vuse Go 1000 — Grape Ice" → "Vuse"
  const stripped = title.split(/[—–-]/)[0].trim();
  return stripped.split(/\s+/).slice(0, 1).join(" ");
};

const lowestPriceJmd = (variants: MedusaVariant[] | null | undefined): number => {
  if (!variants || variants.length === 0) return 0;
  const amounts = variants.flatMap((v) => {
    const calc = v.calculated_price?.calculated_amount;
    if (typeof calc === "number") return [calc];
    const jmd = v.prices?.find((p) => p.currency_code === "jmd")?.amount;
    return typeof jmd === "number" ? [jmd] : [];
  });
  return amounts.length ? Math.min(...amounts) : 0;
};

const totalStock = (variants: MedusaVariant[] | null | undefined): number => {
  if (!variants) return 0;
  return variants.reduce((acc, v) => acc + (v.inventory_quantity ?? 0), 0);
};

export function adaptCategory(c: MedusaCategory): Category | null {
  const slug = slugToCategory(c.handle);
  if (!slug) return null;
  return {
    slug,
    name: c.name,
    shortLabel: c.name.split(" ")[0],
    description: c.description ?? "",
    imageUrl: PLACEHOLDER_IMG,
    ageRestricted: ageRestricted(slug),
  };
}

export function adaptVariant(v: MedusaVariant): ProductVariant {
  return {
    id: v.id,
    label: v.title?.trim() || "Default",
    available: (v.inventory_quantity ?? 0) > 0 || !v.manage_inventory,
  };
}

export function adaptProduct(p: MedusaProduct): Product {
  const primaryCat = p.categories?.[0];
  // Default to a permissive bucket only when Medusa returned NO category at all.
  // Unknown handles drop to null → we treat them as accessories (least-restrictive
  // age policy) and log so it surfaces.
  const matched = primaryCat ? slugToCategory(primaryCat.handle) : null;
  const slug: CategorySlug = matched ?? "smoking-accessories";
  if (primaryCat && !matched) {
    console.warn(`[adaptProduct] unknown category handle "${primaryCat.handle}" on product "${p.handle}"`);
  }
  const variants = p.variants ?? [];
  const priceJmd = lowestPriceJmd(variants);
  const stock = totalStock(variants);
  const tagValues = p.tags?.map((t) => t.value.toLowerCase()) ?? [];

  // Badges: derive from tags or simple heuristics.
  const badges: ProductBadge[] = [];
  if (tagValues.includes("best-seller") || tagValues.includes("bestseller")) badges.push("Best Seller");
  if (tagValues.includes("new")) badges.push("New");
  if (stock > 0 && stock < 10) badges.push("Low Stock");

  // Pick the default variant: first available, else first.
  const defaultVariantId =
    variants.find((v) => (v.inventory_quantity ?? 0) > 0 || !v.manage_inventory)?.id ??
    variants[0]?.id;

  return {
    slug: p.handle ?? p.id,
    title: p.title,
    brand: inferBrand(p.title),
    category: slug,
    priceJmd,
    imageUrl: p.thumbnail || p.images?.[0]?.url || PLACEHOLDER_IMG,
    galleryUrls: p.images?.map((i) => i.url ?? PLACEHOLDER_IMG).filter(Boolean) ?? undefined,
    shortDescription: p.description ?? "",
    features: undefined,
    variants: variants.length > 1 ? variants.map(adaptVariant) : undefined,
    defaultVariantId,
    badges,
    rating: 4.7,
    reviewCount: 0,
    inStock: stock > 0,
    ageRestricted: ageRestricted(slug),
  };
}
