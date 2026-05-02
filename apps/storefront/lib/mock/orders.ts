import type { Order } from "../types";
import { defaultZone } from "./zones";
import { products } from "./products";

const sample = products[0];

export const sampleOrder: Order = {
  id: "ord_demo_001",
  number: "OL-2026-0501-7782",
  placedAt: "2026-04-30T18:42:00Z",
  state: "out_for_delivery",
  items: [
    {
      productSlug: sample.slug,
      title: sample.title,
      variantLabel: "Grape Ice",
      qty: 1,
      unitPriceJmd: sample.priceJmd,
      imageUrl: sample.imageUrl,
    },
    {
      productSlug: products[6].slug,
      title: products[6].title,
      qty: 2,
      unitPriceJmd: products[6].priceJmd,
      imageUrl: products[6].imageUrl,
    },
  ],
  subtotalJmd: sample.priceJmd + products[6].priceJmd * 2,
  deliveryFeeJmd: defaultZone.feeJmd,
  totalJmd: sample.priceJmd + products[6].priceJmd * 2 + defaultZone.feeJmd,
  zone: defaultZone,
  paymentMethod: "card",
  paymentStatus: "paid",
  rider: { name: "Andre M.", rating: 4.9, vehicle: "Bike · 142" },
};

export const orderStateOrder = [
  "received",
  "confirmed",
  "preparing",
  "rider_assigned",
  "out_for_delivery",
  "delivered",
] as const;

export const orderStateLabels: Record<Order["state"], string> = {
  received: "Received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  rider_assigned: "Rider Assigned",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};
