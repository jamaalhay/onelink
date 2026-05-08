import "server-only";
import { sdk } from "./client";

const ORDER_FIELDS = [
  "id",
  "display_id",
  "status",
  "fulfillment_status",
  "payment_status",
  "email",
  "created_at",
  "subtotal",
  "shipping_total",
  "tax_total",
  "total",
  "currency_code",
  "*items",
  "items.product_title",
  "items.variant_title",
  "items.product_handle",
  "items.thumbnail",
  "items.unit_price",
  "items.quantity",
  "items.total",
  "*shipping_address",
  "*shipping_methods",
  "shipping_methods.name",
  "*payment_collections",
  "payment_collections.payments.*",
  // Need provider_id to disambiguate Card (pp_stripe_stripe) from
  // Cash on Delivery (pp_cod_cod) on the success/track pages —
  // payment_status alone is "authorized" in both cases.
  "payment_collections.payments.provider_id",
  "*fulfillments",
  "fulfillments.shipped_at",
  "fulfillments.delivered_at",
].join(",");

// Find the provider_id of the most recent payment to disambiguate Card vs COD.
// Returns null if no payments are present (shouldn't happen on a completed order).
export function paymentProviderOf(order: {
  payment_collections?: { payments?: { provider_id?: string | null }[] | null }[] | null;
}): string | null {
  for (const collection of order.payment_collections ?? []) {
    for (const payment of collection.payments ?? []) {
      if (payment.provider_id) return payment.provider_id;
    }
  }
  return null;
}

export function paymentLabelOf(order: {
  payment_status?: string | null;
  payment_collections?: { payments?: { provider_id?: string | null }[] | null }[] | null;
}): string {
  const provider = paymentProviderOf(order);
  if (provider === "pp_cod_cod") return "Cash on Delivery";
  if (provider === "pp_stripe_stripe") {
    return order.payment_status === "captured" ? "Card · Paid" : "Card · Authorized";
  }
  // Fallback: defer to payment_status only.
  return order.payment_status === "captured" || order.payment_status === "authorized"
    ? "Card · Paid"
    : "Cash on Delivery";
}

export async function fetchOrder(orderId: string) {
  try {
    const { order } = await sdk.store.order.retrieve(orderId, { fields: ORDER_FIELDS });
    return order;
  } catch (err) {
    console.error("[medusa.fetchOrder]", err);
    return null;
  }
}

export type OrderState =
  | "received"
  | "confirmed"
  | "preparing"
  | "rider_assigned"
  | "out_for_delivery"
  | "delivered";

/**
 * Map Medusa's payment + fulfillment status to our 6-stage UI lifecycle.
 * Phase 3 (#9) will replace this with a custom order workflow that tracks
 * the stages explicitly. Until then, derive from status fields.
 */
export function deriveOrderStage(order: {
  status?: string | null;
  payment_status?: string | null;
  fulfillment_status?: string | null;
  fulfillments?: { shipped_at?: string | Date | null; delivered_at?: string | Date | null }[] | null;
}): OrderState {
  const fulfilled = (order.fulfillments ?? []).find((f) => f.delivered_at);
  if (fulfilled) return "delivered";
  const shipped = (order.fulfillments ?? []).find((f) => f.shipped_at);
  if (shipped) return "out_for_delivery";

  switch (order.fulfillment_status) {
    case "delivered":
      return "delivered";
    case "shipped":
      return "out_for_delivery";
    case "fulfilled":
      return "rider_assigned";
    case "partially_fulfilled":
      return "preparing";
    case "not_fulfilled":
    default:
      break;
  }
  if (order.payment_status === "captured" || order.payment_status === "authorized") return "confirmed";
  return "received";
}
