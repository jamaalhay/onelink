import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { formatJmd } from "@/lib/format";
import { fetchOrder } from "@/lib/medusa/orders";
import { OrderSummary } from "@/components/site/order-summary";
import { TrustStrip } from "@/components/site/trust-strip";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { ReorderEssentials } from "@/components/site/reorder-essentials";
import { NeedHelp } from "@/components/site/need-help";

export const metadata = { title: "Order Confirmed" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id } = await params;
  const order = await fetchOrder(id);
  if (!order) notFound();

  const customerName = order.shipping_address?.first_name ?? "friend";
  const orderNumber = `OL-${order.display_id ?? order.id.slice(-6).toUpperCase()}`;
  const placedAt = order.created_at ? new Date(order.created_at) : new Date();
  const paymentLabel = order.payment_status === "captured" || order.payment_status === "authorized"
    ? "Card · Paid"
    : "Cash on Delivery";
  const zoneLabel = order.shipping_methods?.[0]?.name ?? "Kingston";

  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-12 lg:py-16 flex flex-col items-center text-center">
          <CheckCircle size={56} weight="duotone" className="text-[var(--color-accent)]" />
          <p className="eyebrow mt-5">Thank you, {customerName}</p>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mt-3">
            Your order has been confirmed.
          </h1>
          <p className="text-base text-[var(--color-text-muted)] mt-3 max-w-md">
            Order{" "}
            <span className="font-medium text-[var(--color-text)]">{orderNumber}</span> for{" "}
            <span className="font-medium text-[var(--color-text)]">{formatJmd(order.total ?? 0)}</span>{" "}
            is being prepared.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link
              href={`/track/${order.id}`}
              className="inline-flex items-center gap-2 h-12 px-5 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-all active:scale-[0.98]"
            >
              Track your order
              <ArrowRight size={16} weight="bold" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center h-12 px-5 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] font-medium"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10 grid lg:grid-cols-[1fr_24rem] gap-10">
        <div className="space-y-4">
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6">
            <h2 className="text-base font-semibold mb-4">Order details</h2>
            <dl className="grid grid-cols-2 gap-y-3 text-sm">
              <Row label="Order number" value={orderNumber} />
              <Row label="Placed" value={placedAt.toLocaleString("en-JM")} />
              <Row label="Payment" value={paymentLabel} />
              <Row label="Delivery zone" value={zoneLabel} />
            </dl>
          </div>
          <ReorderEssentials />
          <NeedHelp message={`Hi Onelink, question about ${orderNumber}.`} />
        </div>
        <OrderSummary
          data={{
            items: (order.items ?? []).map((it) => ({
              id: it.id,
              title: it.product_title ?? "Item",
              variant_title: it.variant_title,
              thumbnail: it.thumbnail,
              unit_price: it.unit_price,
              quantity: it.quantity,
              total: it.total,
            })),
            subtotal: order.subtotal,
            shipping_total: order.shipping_total,
            total: order.total,
            shipping_methods: order.shipping_methods,
          }}
          zoneLabel={zoneLabel}
        />
      </section>

      <WhatsAppCta context="order-success" message={`Hi Onelink, question about order ${orderNumber}.`} />
      <TrustStrip />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-[var(--color-text)] font-medium">{value}</dd>
    </>
  );
}
