import { fetchProducts } from "@/lib/medusa/server";
import { ProductCard } from "@/components/site/product-card";
import { CategoryChips } from "@/components/site/category-chips";
import { FilterSidebar } from "@/components/site/filter-sidebar";
import { TrustStrip } from "@/components/site/trust-strip";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { ShopSearch } from "@/components/site/shop-search";
import { Pagination } from "@/components/site/pagination";
import { TrackPageView } from "@/components/site/track-page-view";
import { SortSelect } from "@/components/site/sort-select";
import {
  filterProducts,
  normalizeAvailability,
  normalizePage,
  normalizePrice,
  normalizeSort,
  paginateProducts,
  shopFiltersToQuery,
  sortProducts,
  type ShopFilterState,
  type SortKey,
} from "@/lib/shop-filtering";

export const metadata = {
  title: "Shop",
  description: "Browse vapes, pouches, lighters, drinks, snacks and more.",
};

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    brand?: string;
    price?: string;
    availability?: string;
    page?: string;
  }>;
}

const PRODUCTS_PER_PAGE = 16;

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q, sort: rawSort, brand, price, availability, page: rawPage } = await searchParams;
  const trimmedQ = q?.trim() || undefined;
  const sort = normalizeSort(rawSort);
  const filters: ShopFilterState = {
    q: trimmedQ,
    sort,
    brand,
    price: normalizePrice(price),
    availability: normalizeAvailability(availability),
  };
  const { products: allProducts } = await fetchProducts({ q: trimmedQ, limit: 100 });
  const filteredProducts = sortProducts(filterProducts(allProducts, filters), sort);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const page = normalizePage(rawPage, totalPages);
  const products = paginateProducts(filteredProducts, page, PRODUCTS_PER_PAGE);
  const paginationQuery = shopFiltersToQuery({ ...filters, page: undefined });

  return (
    <>
      {trimmedQ && <TrackPageView kind="search" query={trimmedQ} />}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="eyebrow mb-2">{trimmedQ ? "Search" : "Shop"}</p>
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">
                {trimmedQ ? `Results for "${trimmedQ}"` : "All Products"}
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">
                {products.length === 0
                  ? trimmedQ
                    ? "No matches. Try a different search."
                    : "No products available."
                  : `${filteredProducts.length} ${filteredProducts.length === 1 ? "item" : "items"} ${trimmedQ ? "matching" : "ready for delivery"}`}
              </p>
            </div>
            <ShopSearch defaultValue={trimmedQ} />
          </div>
          <div className="mt-8">
            <CategoryChips />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10">
        <div className="grid lg:grid-cols-[15rem_1fr] gap-10">
          <FilterSidebar products={allProducts} filters={filters} />
          <div>
            <h2 className="sr-only">Products</h2>
            <SortBar count={filteredProducts.length} page={page} totalPages={totalPages} sort={sort} />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
            {filteredProducts.length > 0 && (
              <Pagination current={page} total={totalPages} basePath="/shop" query={paginationQuery} />
            )}
          </div>
        </div>
      </section>

      <TrustStrip />
      <WhatsAppCta message="Hi Onelink, I can't find a product." />
    </>
  );
}

function SortBar({
  count,
  page,
  totalPages,
  sort,
}: {
  count: number;
  page: number;
  totalPages: number;
  sort: SortKey;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-[var(--color-text-muted)]">
        Showing <span className="text-[var(--color-text)] font-medium">{count}</span> products
        {totalPages > 1 && (
          <span>
            {" "}
            · Page {page} of {totalPages}
          </span>
        )}
      </p>
      <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        Sort by
        <SortSelect value={sort} />
      </label>
    </div>
  );
}
