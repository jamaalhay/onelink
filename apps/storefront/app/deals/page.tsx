import { fetchProducts } from "@/lib/medusa/server";
import { ProductCard } from "@/components/site/product-card";
import { TrustStrip } from "@/components/site/trust-strip";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";

export const metadata = {
  title: "Deals",
  description: "Current Onelink offers and high-value picks.",
};

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const { products } = await fetchProducts({ limit: 100 });
  const deals = products
    .filter((p) => p.badges.includes("Best Seller") || p.badges.includes("Low Stock") || p.inStock)
    .slice(0, 12);

  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10">
          <p className="eyebrow mb-2">Deals</p>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Today&apos;s best picks</h1>
          <p className="mt-3 text-sm text-[var(--color-text-muted)] max-w-prose">
            Fast-moving products, current standouts, and easy add-to-cart picks for Kingston delivery.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {deals.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <WhatsAppCta message="Hi Onelink, do you have any current deals?" />
      <TrustStrip />
    </>
  );
}
