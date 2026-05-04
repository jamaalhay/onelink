import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr";
import { formatJmd } from "@/lib/format";
import { getCart } from "@/lib/medusa/cart";
import { TrustStrip } from "@/components/site/trust-strip";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { CartLineItem } from "@/components/site/cart-line-item";

export const metadata = { title: "Your Cart" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();
  const items = cart?.items ?? [];
  const itemCount = items.reduce((n, it) => n + (it.quantity ?? 0), 0);
  const subtotal = cart?.subtotal ?? 0;
  const shippingTotal = cart?.shipping_total ?? 0;
  const total = cart?.total ?? subtotal;
  const regionName = cart?.shipping_address?.city ?? "your zone";

  if (itemCount === 0) {
    return (
      <>
        <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-20 text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Your cart is empty</h1>
          <p className="text-base text-[var(--color-text-muted)] mt-3 max-w-md mx-auto">
            Browse the catalog and add a few items to get started.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-[var(--radius-button)] bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-white font-medium"
          >
            Browse the shop
          </Link>
        </section>
        <WhatsAppCta message="Hi Onelink, I'd like help finding products." />
        <TrustStrip />
      </>
    );
  }

  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8">
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Your Cart</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10 grid lg:grid-cols-[1fr_24rem] gap-10">
        <ul className="flex flex-col divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {items.map((it) => (
            <CartLineItem
              key={it.id}
              id={it.id}
              productHandle={it.product_handle ?? ""}
              productTitle={it.product_title ?? "Item"}
              variantTitle={it.variant_title}
              thumbnail={it.thumbnail}
              unitPrice={it.unit_price ?? 0}
              quantity={it.quantity ?? 0}
              total={it.total ?? 0}
              size="page"
            />
          ))}
        </ul>

        <div className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-4">
              Promo code
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter promo"
                className="flex-1 h-10 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
                disabled
              />
              <button
                type="button"
                disabled
                className="h-10 px-4 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm font-medium opacity-50"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 space-y-3">
            <SummaryRow label="Subtotal" value={formatJmd(subtotal)} />
            <SummaryRow
              label={shippingTotal > 0 ? `Delivery · ${regionName}` : "Delivery — set at checkout"}
              value={shippingTotal > 0 ? formatJmd(shippingTotal) : "—"}
            />
            <div className="flex items-baseline justify-between pt-3 mt-3 border-t border-[var(--color-border)]">
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-semibold">{formatJmd(total)}</p>
            </div>
            <Link
              href="/checkout"
              className="mt-3 h-12 w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-white font-medium transition-all active:scale-[0.98]"
            >
              <ShoppingBag size={18} weight="bold" />
              Proceed to Checkout
            </Link>
            <p className="text-xs text-center text-[var(--color-text-muted)]">
              Secure checkout · Card or COD
            </p>
          </div>
        </div>
      </section>

      <WhatsAppCta message="Hi Onelink, I have a question about my cart." />
      <TrustStrip />
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="text-[var(--color-text)] font-medium">{value}</span>
    </div>
  );
}
