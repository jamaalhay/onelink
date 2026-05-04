"use client";

import { useEffect } from "react";

const SESSION_KEY = "onelink_cart_warmed";

// Fires once per tab session: kicks off a PUT /api/cart so a Medusa cart
// exists before the user clicks "Add to cart". The cart cookie is httpOnly
// so we can't check it from JS — instead we gate on sessionStorage. The
// PUT is idempotent (returns the existing cart if one already exists), so
// firing once per tab is fine.
export function CartWarmup() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    sessionStorage.setItem(SESSION_KEY, "1");
    // Fire-and-forget. If it fails, /api/cart POST will still create the
    // cart on the actual add-to-cart click.
    fetch("/api/cart", { method: "PUT" }).catch(() => {});
  }, []);
  return null;
}
