"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Check, ShoppingBag, Star } from "@phosphor-icons/react/dist/ssr";
import type { Product } from "@/lib/types";
import { formatJmd, formatRating } from "@/lib/format";
import { trackAddToCart } from "@/lib/analytics";
import { useCart, type ClientCart } from "@/lib/cart/use-cart";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryBadge = product.badges[0];
  const { replaceCart } = useCart();
  const [pending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const variantId = product.defaultVariantId;
  const canAdd = product.inStock && Boolean(variantId);

  const add = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!variantId) return;
    startTransition(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; cart?: ClientCart };
      if (res.ok && data.ok) {
        replaceCart(data.cart ?? null);
        trackAddToCart({
          variantId,
          productTitle: product.title,
          price: product.priceJmd,
          quantity: 1,
          currency: "JMD",
        });
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 1600);
      }
    });
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col h-full"
    >
      <div className="relative aspect-[4/5] bg-[var(--color-bg-alt)] rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={
            product.inStock
              ? "object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              : "object-cover opacity-60"
          }
          unoptimized
        />
        {primaryBadge && (
          <span className="absolute left-3 top-3 inline-flex items-center bg-[var(--color-text)] text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded">
            {primaryBadge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute left-3 top-3 inline-flex items-center bg-[var(--color-text-dim)] text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
      </div>

      <div className="pt-3 flex flex-col gap-1.5">
        <p className="text-xs text-[var(--color-text-muted)]">{product.brand}</p>
        <h3 className="text-sm font-medium text-[var(--color-text)] leading-tight line-clamp-1">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-[var(--color-text)]">
            {formatJmd(product.priceJmd)}
          </p>
          <span className="inline-flex items-center gap-0.5 text-xs text-[var(--color-text-muted)]">
            <Star size={12} weight="fill" className="text-[var(--color-warning)]" />
            {formatRating(product.rating)}
            <span className="text-[var(--color-text-dim)]">({product.reviewCount})</span>
          </span>
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!canAdd || pending}
          className="mt-2 h-10 inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-white text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {justAdded ? (
            <>
              <Check size={15} weight="bold" />
              Added
            </>
          ) : !canAdd ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingBag size={15} weight="bold" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </Link>
  );
}
