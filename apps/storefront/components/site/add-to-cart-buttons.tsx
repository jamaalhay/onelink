"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Minus, Plus, Check } from "@phosphor-icons/react/dist/ssr";
import type { Product } from "@/lib/types";

interface AddToCartButtonsProps {
  product: Product;
}

export function AddToCartButtons({ product }: AddToCartButtonsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants?.find((v) => v.available)?.id ?? product.defaultVariantId
  );
  const [justAdded, setJustAdded] = useState(false);

  const variantId = selectedVariant ?? product.defaultVariantId;
  const inStock = product.inStock && Boolean(variantId);

  const handleAddToCart = (then?: "stay" | "checkout") => {
    if (!variantId) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variant_id: variantId, quantity: qty }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          console.error("[add-to-cart] failed:", res.status, data);
        }
      } catch (err) {
        console.error("[add-to-cart] threw:", err);
      }
      if (then === "checkout") {
        router.push("/checkout");
      } else {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Variant selector */}
      {product.variants && product.variants.length > 0 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-[var(--color-text)]">Variant</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => {
              const on = v.id === selectedVariant;
              if (!v.available) {
                return (
                  <span
                    key={v.id}
                    className="inline-flex items-center h-10 px-4 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] text-sm line-through cursor-not-allowed"
                  >
                    {v.label}
                  </span>
                );
              }
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVariant(v.id)}
                  className={
                    on
                      ? "inline-flex items-center h-10 px-4 rounded-[var(--radius-button)] border-2 border-[var(--color-accent)] text-[var(--color-text)] text-sm font-medium"
                      : "inline-flex items-center h-10 px-4 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text)] text-sm font-medium transition-colors"
                  }
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex items-end gap-3 mt-2">
        <div>
          <p className="text-sm font-medium text-[var(--color-text)] mb-2">Quantity</p>
          <div className="inline-flex items-center border border-[var(--color-border)] rounded-[var(--radius-button)] h-12">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 h-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-30"
              disabled={qty <= 1 || pending}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span className="w-10 text-center text-base font-medium" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="px-3 h-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              disabled={pending}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleAddToCart("stay")}
          disabled={!inStock || pending}
          className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-all active:scale-[0.98] hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {justAdded ? (
            <>
              <Check size={18} weight="bold" />
              Added to cart
            </>
          ) : pending ? (
            <>Adding…</>
          ) : !inStock ? (
            <>
              <ShoppingBag size={18} weight="bold" />
              Out of Stock
            </>
          ) : (
            <>
              <ShoppingBag size={18} weight="bold" />
              Add to Cart
            </>
          )}
        </button>
      </div>

      {inStock && (
        <button
          type="button"
          onClick={() => handleAddToCart("checkout")}
          disabled={pending}
          className="h-12 inline-flex items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Now &mdash; Fast Checkout
        </button>
      )}
    </div>
  );
}
