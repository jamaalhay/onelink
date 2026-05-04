// GA4 event helpers. The 10 events here map 1:1 to PRD §9.4. We use GA4's
// recommended event names where they exist (purchase, add_to_cart,
// begin_checkout, etc.) so the standard reports work; custom names for the
// ones GA4 doesn't have a built-in for (track_order, whatsapp_click).
//
// Safe to call before gtag loads — the snippet defines window.dataLayer
// synchronously, so push()'d events queue and replay once gtag.js is ready.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const gaEnabled = Boolean(GA_ID);

function track(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  // Push into dataLayer regardless — GTM/gtag both read from it.
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...params });
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params ?? {});
  }
}

export function trackCategoryViewed(category: { handle: string; name: string }): void {
  track("view_item_list", { item_list_id: category.handle, item_list_name: category.name });
}

export function trackSearch(query: string): void {
  track("search", { search_term: query });
}

export function trackProductViewed(p: {
  id: string;
  handle: string;
  title: string;
  price?: number | null;
  currency?: string;
  category?: string | null;
}): void {
  track("view_item", {
    currency: (p.currency ?? "JMD").toUpperCase(),
    value: p.price ?? 0,
    items: [{
      item_id: p.id,
      item_name: p.title,
      item_category: p.category ?? undefined,
      price: p.price ?? 0,
    }],
  });
}

export function trackAddToCart(input: {
  variantId: string;
  productTitle: string;
  price?: number | null;
  quantity: number;
  currency?: string;
}): void {
  track("add_to_cart", {
    currency: (input.currency ?? "JMD").toUpperCase(),
    value: (input.price ?? 0) * input.quantity,
    items: [{
      item_id: input.variantId,
      item_name: input.productTitle,
      price: input.price ?? 0,
      quantity: input.quantity,
    }],
  });
}

export function trackBeginCheckout(cart: {
  total?: number | null;
  currency?: string | null;
  items?: { id: string; product_title?: string; quantity?: number; unit_price?: number }[] | null;
}): void {
  track("begin_checkout", {
    currency: (cart.currency ?? "JMD").toUpperCase(),
    value: cart.total ?? 0,
    items: (cart.items ?? []).map((it) => ({
      item_id: it.id,
      item_name: it.product_title ?? "Item",
      price: it.unit_price ?? 0,
      quantity: it.quantity ?? 1,
    })),
  });
}

export function trackPaymentMethodSelected(method: "card" | "cod"): void {
  track("add_payment_info", { payment_type: method });
}

export function trackPurchase(input: {
  orderId: string;
  total: number;
  currency?: string;
  paymentMethod?: "card" | "cod";
}): void {
  track("purchase", {
    transaction_id: input.orderId,
    value: input.total,
    currency: (input.currency ?? "JMD").toUpperCase(),
    payment_type: input.paymentMethod,
  });
}

export function trackOrderViewed(orderId: string): void {
  track("track_order", { order_id: orderId });
}

export function trackWhatsAppClick(context: string): void {
  track("whatsapp_click", { context });
}
