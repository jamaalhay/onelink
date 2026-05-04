"use client";

import { useEffect } from "react";

const CART_COOKIE = "onelink_cart_id";

// Fires once per visitor: if no cart cookie is present, kicks off a
// PUT /api/cart so a Medusa cart exists before the user clicks "Add to cart".
// Runs in the background — never blocks render or interaction.
export function CartWarmup() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.cookie.split("; ").some((c) => c.startsWith(`${CART_COOKIE}=`))) return;
    // Fire-and-forget. Failure is fine — the actual add-to-cart will create
    // the cart on demand if this missed.
    fetch("/api/cart", { method: "PUT" }).catch(() => {});
  }, []);
  return null;
}
