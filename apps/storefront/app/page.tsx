import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { fetchCategories, fetchFeaturedProducts } from "@/lib/medusa/server";
import { CategoryCard } from "@/components/site/category-card";
import { ProductCard } from "@/components/site/product-card";
import { TrustStrip } from "@/components/site/trust-strip";
import { HowItWorks } from "@/components/site/how-it-works";
import { Testimonials } from "@/components/site/testimonials";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    fetchFeaturedProducts(8),
    fetchCategories(),
  ]);

  return (
    <>
      {/* Hero — split, content left, isolated product image right (DESIGN.md §9) */}
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="eyebrow mb-4">Innovative · Helpful · Essential</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02]">
              One link.<br />
              Endless{" "}
              <span className="text-[var(--color-accent)]">possibilities</span>.
            </h1>
            <p className="mt-6 text-base lg:text-lg text-[var(--color-text-muted)] max-w-[52ch] leading-relaxed">
              Premium products delivered to your door in 15&ndash;30 minutes.
              Vapes, pouches, lighters, drinks, snacks &mdash; curated, discreetly
              packaged, on the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="h-12 inline-flex items-center px-6 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-all active:scale-[0.98] hover:-translate-y-px"
              >
                Shop now
              </Link>
              <Link
                href="/track"
                className="h-12 inline-flex items-center px-6 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] font-medium transition-colors"
              >
                Track an order
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[var(--color-text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={16} weight="duotone" className="text-[var(--color-accent)]" />
                100% Authentic
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock size={16} weight="duotone" className="text-[var(--color-accent)]" />
                Secure Checkout
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Sparkle size={16} weight="duotone" className="text-[var(--color-accent)]" />
                Discreet Packaging
              </span>
            </div>
          </div>
          <div className="relative aspect-[4/5] lg:aspect-square w-full max-w-md mx-auto bg-[var(--color-bg-alt)] rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden">
            <Image
              src="/placeholder-product.svg"
              alt="Featured product"
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 40vw"
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-16 lg:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-2">Shop by category</p>
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
              Curated. Stocked. Ready.
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden sm:block text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
          {categories.map((c) => (
            <CategoryCard key={c.slug} category={c} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[var(--color-bg-alt)] border-y border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-16 lg:py-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Featured</p>
              <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">
                Best sellers this week.
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:block text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <Testimonials />
      <WhatsAppCta message="Hi Onelink, I'd like to ask about a product." />
      <TrustStrip />
    </>
  );
}
