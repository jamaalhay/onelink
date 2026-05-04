import { fetchProducts } from "@/lib/medusa/server";
import { ProductCard } from "@/components/site/product-card";
import { CategoryChips } from "@/components/site/category-chips";
import { FilterSidebar } from "@/components/site/filter-sidebar";
import { TrustStrip } from "@/components/site/trust-strip";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { ShopSearch } from "@/components/site/shop-search";
import { Pagination } from "@/components/site/pagination";

export const metadata = {
  title: "Shop",
  description: "Browse vapes, pouches, lighters, drinks, snacks and more.",
};

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { q } = await searchParams;
  const trimmedQ = q?.trim() || undefined;
  const { products } = await fetchProducts({ q: trimmedQ, limit: 100 });
  return (
    <>
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
                  : `${products.length} ${products.length === 1 ? "item" : "items"} ${trimmedQ ? "matching" : "— ready for delivery"}`}
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
          <FilterSidebar />
          <div>
            <SortBar count={products.length} />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
            {products.length > 0 && <Pagination current={1} total={Math.max(1, Math.ceil(products.length / 16))} />}
          </div>
        </div>
      </section>

      <TrustStrip />
      <WhatsAppCta message="Hi Onelink, I can't find a product." />
    </>
  );
}

function SortBar({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-[var(--color-text-muted)]">
        Showing <span className="text-[var(--color-text)] font-medium">{count}</span> products
      </p>
      <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
        Sort by
        <select className="h-9 px-3 pr-8 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2">
          <option>Popular</option>
          <option>Newest</option>
          <option>Price: low to high</option>
          <option>Price: high to low</option>
          <option>Rating</option>
        </select>
      </label>
    </div>
  );
}
