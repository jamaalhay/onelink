export type CategorySlug =
  | "vapes"
  | "zyn-pouches"
  | "lighters"
  | "smoking-accessories"
  | "drinks"
  | "snacks"
  | "rolling-papers";

export interface Category {
  slug: CategorySlug;
  name: string;
  shortLabel: string;
  description: string;
  imageUrl: string;
  ageRestricted: boolean;
}

export type ProductBadge = "Best Seller" | "New" | "Low Stock";

export interface ProductVariant {
  id: string;
  label: string;
  available: boolean;
}

export interface Product {
  slug: string;
  title: string;
  brand: string;
  category: CategorySlug;
  priceJmd: number;
  comparePriceJmd?: number;
  imageUrl: string;
  galleryUrls?: string[];
  shortDescription: string;
  features?: string[];
  variants?: ProductVariant[];
  /** Real Medusa variant ID for the (default) addable variant. Set by the adapter. */
  defaultVariantId?: string;
  badges: ProductBadge[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  ageRestricted: boolean;
}

export interface DeliveryZone {
  slug: string;
  name: string;
  feeJmd: number;
  etaMin: number;
  etaMax: number;
  band: "core" | "outer";
  /** Approximate centroid — used by the tracking-page map and ETA preview. */
  lat?: number;
  lng?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  area: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
}

export type OrderState =
  | "received"
  | "confirmed"
  | "preparing"
  | "rider_assigned"
  | "out_for_delivery"
  | "delivered";

export interface OrderLineItem {
  productSlug: string;
  title: string;
  variantLabel?: string;
  qty: number;
  unitPriceJmd: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  number: string;
  placedAt: string;
  state: OrderState;
  items: OrderLineItem[];
  subtotalJmd: number;
  deliveryFeeJmd: number;
  totalJmd: number;
  zone: DeliveryZone;
  paymentMethod: "card" | "cod";
  paymentStatus: "paid" | "pending" | "failed";
  rider?: { name: string; rating: number; vehicle: string };
}
