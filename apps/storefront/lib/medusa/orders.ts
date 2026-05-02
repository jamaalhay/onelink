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
  "*fulfillments",
  "fulfillments.shipped_at",
  "fulfillments.delivered_at",
].join(",");

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
