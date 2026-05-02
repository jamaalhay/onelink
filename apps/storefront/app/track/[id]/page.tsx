import { notFound } from "next/navigation";
import { Phone, ChatCircleText, Motorcycle, Star } from "@phosphor-icons/react/dist/ssr";
import { formatJmd } from "@/lib/format";
import { fetchOrder, deriveOrderStage } from "@/lib/medusa/orders";
import { StatusTimeline } from "@/components/site/status-timeline";
import { OrderSummary } from "@/components/site/order-summary";
import { TrustStrip } from "@/components/site/trust-strip";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { NeedHelp } from "@/components/site/need-help";
import { ReorderEssentials } from "@/components/site/reorder-essentials";

export const metadata = { title: "Track Order" };
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TrackPage({ params }: PageProps) {
  const { id } = await params;
  const order = await fetchOrder(id);
  if (!order) notFound();

  const orderNumber = `OL-${order.display_id ?? order.id.slice(-6).toUpperCase()}`;
  const stage = deriveOrderStage(order);
  const zoneName = order.shipping_methods?.[0]?.name ?? "Kingston";

  // Mock rider info — replaced when the dispatch system is wired up in #9.
  const mockRider = { name: "Andre M.", rating: 4.9, vehicle: "Bike · 142" };

  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8">
          <p className="eyebrow mb-2">Tracking</p>
          <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Order {orderNumber}</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            Estimated arrival in 15–45 minutes · {zoneName}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10 grid lg:grid-cols-[1fr_24rem] gap-10">
        <div className="space-y-8">
          {/* Timeline */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-4">
              Order Progress
            </p>
            <StatusTimeline current={stage} />
          </div>

          {/* Map placeholder */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-alt)] aspect-[16/7] flex items-center justify-center">
            <p className="text-sm text-[var(--color-text-muted)]">Rider location · live map</p>
          </div>

          {/* Rider card */}
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] shrink-0">
              <Motorcycle size={26} weight="duotone" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-[var(--color-text)]">{mockRider.name}</p>
              <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                <span className="inline-flex items-center gap-0.5">
                  <Star size={13} weight="fill" className="text-[var(--color-warning)]" />
                  {mockRider.rating}
                </span>
                <span className="text-[var(--color-text-dim)]">·</span>
                <span>{mockRider.vehicle}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                aria-label="Call rider"
              >
                <Phone size={16} />
              </button>
              <button
                type="button"
                className="w-10 h-10 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] hover:bg-[var(--color-surface)]"
                aria-label="Message rider"
              >
                <ChatCircleText size={16} />
              </button>
            </div>
          </div>

          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-3">
              Order details
            </p>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-[var(--color-text-muted)]">Total paid</dt>
              <dd className="text-[var(--color-text)] font-medium">{formatJmd(order.total ?? 0)}</dd>
              <dt className="text-[var(--color-text-muted)]">Payment</dt>
              <dd className="text-[var(--color-text)] font-medium">
                {order.payment_status === "captured" || order.payment_status === "authorized"
                  ? "Card"
                  : "Cash on Delivery"}
              </dd>
              <dt className="text-[var(--color-text-muted)]">Items</dt>
              <dd className="text-[var(--color-text)] font-medium">{(order.items ?? []).length}</dd>
            </dl>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <NeedHelp message={`Hi Onelink, I need help with order ${orderNumber}.`} />
            <ReorderEssentials />
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
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
            zoneLabel={zoneName}
          />
          <WhatsAppCta variant="inline" message={`Hi Onelink, status update on ${orderNumber}?`} />
        </div>
      </section>

      <TrustStrip />
    </>
  );
}
