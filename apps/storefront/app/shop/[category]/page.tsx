import { notFound } from "next/navigation";
import { fetchCategoryByHandle, fetchProducts } from "@/lib/medusa/server";
import { ProductCard } from "@/components/site/product-card";
import { CategoryChips } from "@/components/site/category-chips";
import { FilterSidebar } from "@/components/site/filter-sidebar";
import { TrustStrip } from "@/components/site/trust-strip";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { TrackPageView } from "@/components/site/track-page-view";
import { Pagination } from "@/components/site/pagination";
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

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{
    sort?: string;
    brand?: string;
    price?: string;
    availability?: string;
    page?: string;
  }>;
}

const PRODUCTS_PER_PAGE = 16;

// 60s ISR — category listings don't change minute-to-minute.
export const revalidate = 60;

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const cat = await fetchCategoryByHandle(slug);
  if (!cat) return { title: "Shop" };
  return { title: cat.name, description: cat.description };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category: slug } = await params;
  const { sort: rawSort, brand, price, availability, page: rawPage } = await searchParams;
  const cat = await fetchCategoryByHandle(slug);
  if (!cat) notFound();

  const sort = normalizeSort(rawSort);
  const filters: ShopFilterState = {
    sort,
    brand,
    price: normalizePrice(price),
    availability: normalizeAvailability(availability),
  };
  const { products: allItems } = await fetchProducts({ category: slug, limit: 100 });
  const filteredItems = sortProducts(filterProducts(allItems, filters), sort);
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PRODUCTS_PER_PAGE));
  const page = normalizePage(rawPage, totalPages);
  const items = paginateProducts(filteredItems, page, PRODUCTS_PER_PAGE);
  const basePath = `/shop/${cat.slug}`;
  const paginationQuery = shopFiltersToQuery({ ...filters, page: undefined });

  return (
    <>
      <TrackPageView kind="category" category={{ handle: cat.slug, name: cat.name }} />
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8 lg:py-10">
          <p className="eyebrow mb-2">Shop</p>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">{cat.name}</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-prose">
            {cat.description} &mdash; {filteredItems.length} items.
          </p>
          <div className="mt-6">
            <CategoryChips active={cat.slug} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10">
        <h2 className="sr-only">{cat.name} products</h2>
        <div className="grid lg:grid-cols-[15rem_1fr] gap-10">
          <FilterSidebar products={allItems} filters={filters} basePath={basePath} activeCategory={cat.slug} />
          <div>
            <SortBar count={filteredItems.length} page={page} totalPages={totalPages} sort={sort} />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {items.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
            {filteredItems.length > 0 && (
              <Pagination current={page} total={totalPages} basePath={basePath} query={paginationQuery} />
            )}
          </div>
        </div>
      </section>

      <TrustStrip />
      <WhatsAppCta message={`Hi Onelink, I have a question about ${cat.name}.`} />
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
