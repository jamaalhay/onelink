import Image from "next/image";
import { formatJmd } from "@/lib/format";

export interface OrderSummaryItem {
  id: string;
  title: string;
  variant_title?: string | null;
  thumbnail?: string | null;
  unit_price?: number | null;
  quantity?: number | null;
  total?: number | null;
}

export interface OrderSummaryData {
  items?: OrderSummaryItem[] | null;
  subtotal?: number | null;
  shipping_total?: number | null;
  total?: number | null;
  shipping_methods?: { name?: string | null }[] | null;
}

interface OrderSummaryProps {
  data: OrderSummaryData | null;
  showItems?: boolean;
  zoneLabel?: string;
}

export function OrderSummary({ data, showItems = true, zoneLabel }: OrderSummaryProps) {
  if (!data) {
    return (
      <aside className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 bg-[var(--color-bg)]">
        <p className="text-sm text-[var(--color-text-muted)]">Cart is empty.</p>
      </aside>
    );
  }
  const items = data.items ?? [];
  const subtotal = data.subtotal ?? 0;
  const shipping = data.shipping_total ?? 0;
  const total = data.total ?? subtotal;
  const shippingLabel = zoneLabel
    ? `Delivery · ${zoneLabel}`
    : data.shipping_methods?.[0]?.name
      ? `Delivery · ${data.shipping_methods[0].name}`
      : "Delivery";

  return (
    <aside className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 bg-[var(--color-bg)]">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-4">
        Order Summary
      </p>
      {showItems && items.length > 0 && (
        <ul className="flex flex-col divide-y divide-[var(--color-border)]">
          {items.map((it) => (
            <li key={it.id} className="flex gap-3 py-3">
              <div className="relative w-14 h-16 bg-[var(--color-bg-alt)] rounded-md border border-[var(--color-border)] overflow-hidden shrink-0">
                <Image
                  src={it.thumbnail ?? "/placeholder-product.svg"}
                  alt={it.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)] truncate">{it.title}</p>
                {it.variant_title && it.variant_title !== "Default" && (
                  <p className="text-xs text-[var(--color-text-muted)]">{it.variant_title}</p>
                )}
                <p className="text-xs text-[var(--color-text-muted)] mt-1">Qty {it.quantity ?? 0}</p>
              </div>
              <p className="text-sm font-medium text-[var(--color-text)] whitespace-nowrap">
                {formatJmd(it.total ?? 0)}
              </p>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2 pt-4 mt-4 border-t border-[var(--color-border)] text-sm">
        <Row label="Subtotal" value={formatJmd(subtotal)} />
        <Row
          label={shippingLabel}
          value={shipping > 0 ? formatJmd(shipping) : "Set at checkout"}
        />
      </div>
      <div className="flex items-baseline justify-between pt-4 mt-4 border-t border-[var(--color-border)]">
        <p className="text-sm font-medium text-[var(--color-text)]">Total</p>
        <p className="text-2xl font-semibold text-[var(--color-text)]">{formatJmd(total)}</p>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="text-[var(--color-text)] font-medium">{value}</span>
    </div>
  );
}
