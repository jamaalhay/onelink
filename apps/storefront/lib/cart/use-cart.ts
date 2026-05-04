"use client";

import useSWR from "swr";
import { useCallback } from "react";

export interface CartLineItem {
  id: string;
  product_handle?: string | null;
  product_title?: string | null;
  variant_title?: string | null;
  thumbnail?: string | null;
  unit_price?: number | null;
  quantity?: number | null;
  total?: number | null;
}

export interface ClientCart {
  id: string;
  currency_code?: string | null;
  subtotal?: number | null;
  shipping_total?: number | null;
  total?: number | null;
  items?: CartLineItem[] | null;
}

interface CartResponse {
  cart: ClientCart | null;
}

const fetcher = async (url: string): Promise<CartResponse> => {
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) return { cart: null };
  return (await res.json()) as CartResponse;
};

export function useCart() {
  const { data, mutate, isLoading } = useSWR<CartResponse>("/api/cart", fetcher, {
    // Cart is essentially session state — revalidate on focus so the count
    // is right when the user returns from a tab. No polling.
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
  });

  const cart = data?.cart ?? null;
  const itemCount = (cart?.items ?? []).reduce((n, it) => n + (it.quantity ?? 0), 0);

  // Optimistically replace the cache with the cart returned by the POST/PATCH/DELETE
  // handlers; SWR will skip a revalidation round-trip.
  const replaceCart = useCallback(
    (next: ClientCart | null) => {
      mutate({ cart: next }, { revalidate: false });
    },
    [mutate]
  );

  // Force a re-fetch (used after an action whose API doesn't return the new cart).
  const refresh = useCallback(() => mutate(), [mutate]);

  return { cart, itemCount, isLoading, replaceCart, refresh };
}
