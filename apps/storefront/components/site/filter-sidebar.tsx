import Link from "next/link";
import { categories } from "@/lib/mock/categories";
import type { CategorySlug, Product } from "@/lib/types";
import {
  getBrandCounts,
  isOnSale,
  PRICE_BUCKETS,
  shopFiltersToQuery,
  type AvailabilityKey,
  type PriceKey,
  type ShopFilterState,
} from "@/lib/shop-filtering";

interface FilterSidebarProps {
  basePath?: string;
  products: Product[];
  filters: ShopFilterState;
  activeCategory?: CategorySlug;
}

export function FilterSidebar({
  basePath = "/shop",
  products,
  filters,
  activeCategory,
}: FilterSidebarProps) {
  const categoryCounts = new Map<CategorySlug, number>();
  for (const product of products) {
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
  }

  const brandCounts = getBrandCounts(products);
  const activeFilters = Boolean(filters.brand) || Boolean(filters.price) || Boolean(filters.availability);
  const showCategoryCounts = !activeCategory;

  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-6">
      {activeFilters && (
        <Link
          href={hrefFor(basePath, filters, { brand: null, price: null, availability: null })}
          className="inline-flex text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Clear filters
        </Link>
      )}
      <FilterGroup label="Category">
        <FilterLink
          href={hrefFor("/shop", filters, {})}
          label="All Products"
          count={showCategoryCounts ? products.length : undefined}
          active={!activeCategory}
        />
        {categories.map((c) => (
          <FilterLink
            key={c.slug}
            href={hrefFor(`/shop/${c.slug}`, filters, {})}
            label={c.shortLabel}
            count={showCategoryCounts ? (categoryCounts.get(c.slug) ?? 0) : undefined}
            active={c.slug === activeCategory}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Brand">
        {brandCounts.map(({ brand, count }) => (
          <FilterLink
            key={brand}
            href={hrefFor(basePath, filters, {
              brand: filters.brand?.toLowerCase() === brand.toLowerCase() ? null : brand,
            })}
            label={brand}
            count={count}
            active={filters.brand?.toLowerCase() === brand.toLowerCase()}
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Price (JMD)">
        {PRICE_BUCKETS.map((bucket) => (
          <FilterLink
            key={bucket.value}
            href={hrefFor(basePath, filters, {
              price: filters.price === bucket.value ? null : bucket.value,
            })}
            label={bucket.label}
            active={filters.price === bucket.value}
            shape="radio"
          />
        ))}
      </FilterGroup>
      <FilterGroup label="Availability">
        <FilterLink
          href={hrefFor(basePath, filters, {
            availability: filters.availability === "in-stock" ? null : "in-stock",
          })}
          label="In stock"
          count={products.filter((product) => product.inStock).length}
          active={filters.availability === "in-stock"}
        />
        <FilterLink
          href={hrefFor(basePath, filters, {
            availability: filters.availability === "on-sale" ? null : "on-sale",
          })}
          label="On sale"
          count={products.filter(isOnSale).length}
          active={filters.availability === "on-sale"}
        />
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-3">
        {label}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  label,
  count,
  active,
  shape = "checkbox",
}: {
  href: string;
  label: string;
  count?: number;
  active?: boolean;
  shape?: "checkbox" | "radio";
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className="flex items-center gap-2.5 text-sm text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
    >
      <span
        aria-hidden
        className={
          active
            ? shape === "radio"
              ? "w-4 h-4 rounded-full border-4 border-[var(--color-accent)]"
              : "w-4 h-4 rounded border border-[var(--color-accent)] bg-[var(--color-accent)] shadow-[inset_0_0_0_3px_var(--color-bg)]"
            : shape === "radio"
              ? "w-4 h-4 rounded-full border border-[var(--color-border-strong)]"
              : "w-4 h-4 rounded border border-[var(--color-border-strong)]"
        }
      />
      <span className="flex-1">{label}</span>
      {typeof count === "number" && <span className="text-xs text-[var(--color-text-dim)]">({count})</span>}
    </Link>
  );
}

function hrefFor(
  basePath: string,
  filters: ShopFilterState,
  patch: Partial<Record<"brand", string | null> & Record<"price", PriceKey | null> & Record<"availability", AvailabilityKey | null>>
) {
  const next: ShopFilterState = {
    ...filters,
    page: undefined,
    brand: patch.brand === null ? undefined : patch.brand ?? filters.brand,
    price: patch.price === null ? undefined : patch.price ?? filters.price,
    availability: patch.availability === null ? undefined : patch.availability ?? filters.availability,
  };
  const params = new URLSearchParams(shopFiltersToQuery(next));
  return params.size > 0 ? `${basePath}?${params.toString()}` : basePath;
}
