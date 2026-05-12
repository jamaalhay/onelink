import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, Truck, ShieldCheck, Lock, Package } from "@phosphor-icons/react/dist/ssr";
import { fetchProductByHandle, fetchRelatedProducts, fetchCategoryByHandle } from "@/lib/medusa/server";
import { fetchReviews } from "@/lib/medusa/reviews";
import { defaultZone } from "@/lib/mock/zones";
import { formatJmd, formatRating, formatEtaRange } from "@/lib/format";
import { AddToCartButtons } from "@/components/site/add-to-cart-buttons";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductCard } from "@/components/site/product-card";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { TrustStrip } from "@/components/site/trust-strip";
import { ReviewSummary } from "@/components/site/review-summary";
import { TrackPageView } from "@/components/site/track-page-view";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PdpProps {
  params: Promise<{ slug: string }>;
}

// 60s ISR — products and reviews don't change minute-to-minute, and any
// cart-aware UI lives in the client-side header / drawer, so a cached
// HTML response is safe.
export const revalidate = 60;

export async function generateMetadata({ params }: PdpProps) {
  const { slug } = await params;
  const p = await fetchProductByHandle(slug);
  if (!p) return { title: "Product" };
  return { title: p.title, description: p.shortDescription };
}

export default async function ProductDetailPage({ params }: PdpProps) {
  const { slug } = await params;
  const product = await fetchProductByHandle(slug);
  if (!product) notFound();

  const [category, related, reviews] = await Promise.all([
    fetchCategoryByHandle(product.category),
    fetchRelatedProducts(slug, 4),
    fetchReviews(slug),
  ]);
  const galleryImages = product.galleryUrls?.length
    ? [product.imageUrl, ...product.galleryUrls]
    : [product.imageUrl, product.imageUrl, product.imageUrl];

  return (
    <>
      <TrackPageView
        kind="product"
        product={{
          id: product.defaultVariantId ?? product.slug,
          handle: product.slug,
          title: product.title,
          price: product.priceJmd,
          currency: "JMD",
          category: product.category,
        }}
      />
      {/* Breadcrumb */}
      <nav className="mx-auto max-w-[1400px] px-4 lg:px-10 pt-6 text-xs text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-accent)]">Home</Link>
        <span className="mx-2 text-[var(--color-text-dim)]">›</span>
        <Link href="/shop" className="hover:text-[var(--color-accent)]">Shop</Link>
        {category && (
          <>
            <span className="mx-2 text-[var(--color-text-dim)]">›</span>
            <Link href={`/shop/${category.slug}`} className="hover:text-[var(--color-accent)]">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8 lg:py-10 grid lg:grid-cols-2 gap-10 lg:gap-16">
        <ProductGallery images={galleryImages} alt={product.title} />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-sm text-[var(--color-text-muted)]">{product.brand}</p>
            <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mt-1">{product.title}</h1>
            <div className="flex items-center gap-3 mt-3 text-sm">
              {reviews.summary.count > 0 ? (
                <>
                  <span className="inline-flex items-center gap-1 text-[var(--color-text-muted)]">
                    <Star size={14} weight="fill" className="text-[var(--color-warning)]" />
                    {formatRating(reviews.summary.average)}
                  </span>
                  <span className="text-[var(--color-text-dim)]">·</span>
                  <span className="text-[var(--color-text-muted)]">
                    {reviews.summary.count} review{reviews.summary.count === 1 ? "" : "s"}
                  </span>
                </>
              ) : (
                <span className="text-[var(--color-text-muted)]">No reviews yet</span>
              )}
              {product.badges[0] && (
                <>
                  <span className="text-[var(--color-text-dim)]">·</span>
                  <span className="text-[var(--color-text)] font-medium">{product.badges[0]}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-semibold text-[var(--color-text)]">{formatJmd(product.priceJmd)}</p>
            {product.comparePriceJmd && (
              <p className="text-base text-[var(--color-text-muted)] line-through">
                {formatJmd(product.comparePriceJmd)}
              </p>
            )}
          </div>

          <p className="text-base text-[var(--color-text)] leading-relaxed max-w-prose">
            {product.shortDescription}
          </p>

          <AddToCartButtons product={product} />

          <WhatsAppCta variant="inline" context="pdp" message={`Hi Onelink, I have a question about ${product.title}.`} />

          {/* Delivery reassurance */}
          <div className="mt-2 grid grid-cols-2 gap-3 p-4 rounded-[var(--radius-card)] bg-[var(--color-bg-alt)] border border-[var(--color-border)]">
            <Reassure icon={Truck} label="Delivery" detail={`${defaultZone.name} · ${formatEtaRange(defaultZone.etaMin, defaultZone.etaMax)}`} />
            <Reassure icon={Package} label="Packaging" detail="Discreet & sealed" />
            <Reassure icon={Lock} label="Payment" detail="Card or COD" />
            <Reassure icon={ShieldCheck} label="Quality" detail="100% authentic" />
          </div>

          {/* Details accordion */}
          <Accordion className="mt-2">
            <AccordionItem value="details">
              <AccordionTrigger>Product Details</AccordionTrigger>
              <AccordionContent>
                {product.features?.length ? (
                  <ul className="list-disc pl-5 space-y-1.5 text-[var(--color-text)]">
                    {product.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{product.shortDescription}</p>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="box">
              <AccordionTrigger>What&apos;s in the Box</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-5 space-y-1.5 text-[var(--color-text)]">
                  <li>1 × {product.title}</li>
                  <li>Sealed retail packaging</li>
                  <li>Onelink discreet outer pouch</li>
                  <li>Receipt &amp; quick-start care card</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="usage">
              <AccordionTrigger>Usage &amp; Care</AccordionTrigger>
              <AccordionContent>
                Store at room temperature, away from direct heat or sunlight. Keep out of reach
                of children. {product.ageRestricted ? "Use only as intended; not for use by minors or non-smokers. " : ""}
                Refer to the manufacturer&apos;s instructions on the packaging for full guidance.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
              <AccordionContent>
                Same-day delivery within Kingston · 15&ndash;30 minutes core, 30&ndash;45 minutes outer zones.
                Returns within 7 days for unopened items in original packaging.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="age">
              <AccordionTrigger>Age &amp; Compliance</AccordionTrigger>
              <AccordionContent>
                {product.ageRestricted
                  ? "This product is age-restricted (18+). ID may be required at delivery."
                  : "No age verification required for this product."}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 pb-12">
        <ReviewSummary product={product} data={reviews} />
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="bg-[var(--color-bg-alt)] border-y border-[var(--color-border)]">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-12 lg:py-16">
            <p className="eyebrow mb-2">You may also like</p>
            <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight mb-8">More from {category?.name}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <TrustStrip />
    </>
  );
}

function Reassure({
  icon: Icon,
  label,
  detail,
}: {
  icon: React.ComponentType<{ size?: number | string; weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"; className?: string }>;
  label: string;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon size={20} weight="duotone" className="text-[var(--color-accent)] shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{detail}</p>
      </div>
    </div>
  );
}
