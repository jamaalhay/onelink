import type { Product } from "@/lib/types";

export const SORT_OPTIONS = [
  { value: "popular", label: "Popular" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Rating" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export const PRICE_BUCKETS = [
  { value: "under-500", label: "Under $500", min: 0, max: 500 },
  { value: "500-1000", label: "$500 - $1,000", min: 500, max: 1000 },
  { value: "1000-2000", label: "$1,000 - $2,000", min: 1000, max: 2000 },
  { value: "2000-5000", label: "$2,000 - $5,000", min: 2000, max: 5000 },
  { value: "5000-plus", label: "$5,000 +", min: 5000, max: Number.POSITIVE_INFINITY },
] as const;

export type PriceKey = (typeof PRICE_BUCKETS)[number]["value"];
export type AvailabilityKey = "in-stock" | "on-sale";

export interface ShopFilterState {
  q?: string;
  sort?: SortKey;
  brand?: string;
  price?: PriceKey;
  availability?: AvailabilityKey;
  page?: number;
}

export function normalizeSort(value?: string): SortKey {
  return SORT_OPTIONS.some((option) => option.value === value) ? (value as SortKey) : "popular";
}

export function normalizePrice(value?: string): PriceKey | undefined {
  return PRICE_BUCKETS.some((bucket) => bucket.value === value) ? (value as PriceKey) : undefined;
}

export function normalizeAvailability(value?: string): AvailabilityKey | undefined {
  return value === "in-stock" || value === "on-sale" ? value : undefined;
}

export function normalizePage(value: string | number | undefined, totalPages: number) {
  const page = Number(value ?? 1);
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(1, Math.trunc(page)), Math.max(1, totalPages));
}

export function filterProducts(products: Product[], filters: ShopFilterState) {
  return products.filter((product) => {
    if (filters.brand && product.brand.toLowerCase() !== filters.brand.toLowerCase()) {
      return false;
    }

    if (filters.price) {
      const bucket = PRICE_BUCKETS.find((option) => option.value === filters.price);
      if (bucket && (product.priceJmd < bucket.min || product.priceJmd >= bucket.max)) {
        return false;
      }
    }

    if (filters.availability === "in-stock" && !product.inStock) return false;
    if (filters.availability === "on-sale" && !isOnSale(product)) return false;

    return true;
  });
}

export function sortProducts(products: Product[], sort: SortKey) {
  const sorted = [...products];
  sorted.sort((a, b) => {
    switch (sort) {
      case "newest":
        return Number(b.badges.includes("New")) - Number(a.badges.includes("New")) || titleSort(a, b);
      case "price-asc":
        return a.priceJmd - b.priceJmd || titleSort(a, b);
      case "price-desc":
        return b.priceJmd - a.priceJmd || titleSort(a, b);
      case "rating":
        return b.rating - a.rating || b.reviewCount - a.reviewCount || titleSort(a, b);
      case "popular":
      default:
        return (
          Number(b.inStock) - Number(a.inStock) ||
          Number(b.badges.includes("Best Seller")) - Number(a.badges.includes("Best Seller")) ||
          b.rating - a.rating ||
          titleSort(a, b)
        );
    }
  });
  return sorted;
}

export function paginateProducts(products: Product[], page: number, perPage: number) {
  const start = (page - 1) * perPage;
  return products.slice(start, start + perPage);
}

export function shopFiltersToQuery(filters: ShopFilterState) {
  const query: Record<string, string> = {};
  if (filters.q) query.q = filters.q;
  if (filters.sort && filters.sort !== "popular") query.sort = filters.sort;
  if (filters.brand) query.brand = filters.brand;
  if (filters.price) query.price = filters.price;
  if (filters.availability) query.availability = filters.availability;
  if (filters.page && filters.page > 1) query.page = String(filters.page);
  return query;
}

export function getBrandCounts(products: Product[]) {
  const counts = new Map<string, number>();
  for (const product of products) {
    counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([brand, count]) => ({ brand, count }))
    .sort((a, b) => a.brand.localeCompare(b.brand));
}

export function isOnSale(product: Product) {
  return Boolean(product.comparePriceJmd && product.comparePriceJmd > product.priceJmd);
}

function titleSort(a: Product, b: Product) {
  return a.title.localeCompare(b.title);
}
