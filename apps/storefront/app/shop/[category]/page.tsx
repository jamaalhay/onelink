import { notFound } from "next/navigation";
import { fetchCategoryByHandle, fetchProducts } from "@/lib/medusa/server";
import { ProductCard } from "@/components/site/product-card";
import { CategoryChips } from "@/components/site/category-chips";
import { FilterSidebar } from "@/components/site/filter-sidebar";
import { TrustStrip } from "@/components/site/trust-strip";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const cat = await fetchCategoryByHandle(slug);
  if (!cat) return { title: "Shop" };
  return { title: cat.name, description: cat.description };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const cat = await fetchCategoryByHandle(slug);
  if (!cat) notFound();

  const { products: items } = await fetchProducts({ category: slug, limit: 100 });

  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8 lg:py-10">
          <p className="eyebrow mb-2">Shop</p>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">{cat.name}</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-prose">
            {cat.description} &mdash; {items.length} items.
          </p>
          <div className="mt-6">
            <CategoryChips active={cat.slug} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10">
        <div className="grid lg:grid-cols-[15rem_1fr] gap-10">
          <FilterSidebar />
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {items.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <TrustStrip />
      <WhatsAppCta message={`Hi Onelink, I have a question about ${cat.name}.`} />
    </>
  );
}
