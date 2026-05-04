"use client";

import { useEffect } from "react";
import {
  trackProductViewed,
  trackCategoryViewed,
  trackOrderViewed,
  trackSearch,
  trackPurchase,
} from "@/lib/analytics";

type TrackKind =
  | { kind: "product"; product: { id: string; handle: string; title: string; price?: number | null; currency?: string; category?: string | null } }
  | { kind: "category"; category: { handle: string; name: string } }
  | { kind: "order"; orderId: string }
  | { kind: "search"; query: string }
  | { kind: "purchase"; purchase: { orderId: string; total: number; currency?: string; paymentMethod?: "card" | "cod" } };

// Drop-in client component used by server-rendered pages to fire one of the
// page-level GA events on mount. Keeps server components from reaching for
// "use client" themselves.
export function TrackPageView(props: TrackKind) {
  useEffect(() => {
    if (props.kind === "product") trackProductViewed(props.product);
    else if (props.kind === "category") trackCategoryViewed(props.category);
    else if (props.kind === "order") trackOrderViewed(props.orderId);
    else if (props.kind === "search") trackSearch(props.query);
    else if (props.kind === "purchase") trackPurchase(props.purchase);
    // Fire once per mount; deps include only the identifier(s) so navigations
    // between products correctly retrigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.kind,
    props.kind === "product" ? props.product.id : null,
    props.kind === "category" ? props.category.handle : null,
    props.kind === "order" ? props.orderId : null,
    props.kind === "search" ? props.query : null,
    props.kind === "purchase" ? props.purchase.orderId : null,
  ]);
  return null;
}
