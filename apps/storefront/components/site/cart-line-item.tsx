"use client";

import { useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import { formatJmd } from "@/lib/format";
import { useCart, type ClientCart } from "@/lib/cart/use-cart";

interface CartLineItemProps {
  id: string;
  productHandle: string;
  productTitle: string;
  variantTitle?: string | null;
  thumbnail?: string | null;
  unitPrice: number;
  quantity: number;
  total: number;
  /** UI variant — drawer (compact) or page (full row). */
  size?: "drawer" | "page";
}

export function CartLineItem({
  id,
  productHandle,
  productTitle,
  variantTitle,
  thumbnail,
  unitPrice,
  quantity,
  total,
  size = "page",
}: CartLineItemProps) {
  const { replaceCart } = useCart();
  const [pending, startTransition] = useTransition();

  const onChangeQty = (delta: number) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ line_item_id: id, quantity: quantity + delta }),
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; cart?: ClientCart };
        if (!res.ok) {
          console.error("[cart] updateLineItem failed:", res.status);
          return;
        }
        replaceCart(data.cart ?? null);
      } catch (err) {
        console.error("[cart] updateLineItem", err);
      }
    });
  };

  const onRemove = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/cart?line_item_id=${encodeURIComponent(id)}`, {
          method: "DELETE",
        });
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean; cart?: ClientCart };
        if (!res.ok) {
          console.error("[cart] removeLineItem failed:", res.status);
          return;
        }
        replaceCart(data.cart ?? null);
      } catch (err) {
        console.error("[cart] removeLineItem", err);
      }
    });
  };

  const compact = size === "drawer";
  const imgSize = compact ? "w-16 h-20" : "w-24 h-28";
  const imgSizes = compact ? "64px" : "96px";

  return (
    <li className={compact ? "flex gap-3 p-6" : "flex gap-4 py-5"} aria-busy={pending}>
      <div className={`relative ${imgSize} bg-[var(--color-bg-alt)] rounded-md border border-[var(--color-border)] overflow-hidden shrink-0`}>
        {thumbnail ? (
          <Image src={thumbnail} alt={productTitle} fill sizes={imgSizes} className="object-cover" unoptimized />
        ) : (
          <Image src="/placeholder-product.svg" alt={productTitle} fill sizes={imgSizes} className="object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <Link
          href={`/products/${productHandle}`}
          className={`${compact ? "text-sm" : "text-base"} font-medium leading-tight line-clamp-2 hover:text-[var(--color-accent)] transition-colors`}
        >
          {productTitle}
        </Link>
        {variantTitle && variantTitle !== "Default" && (
          <p className={`${compact ? "text-xs" : "text-sm"} text-[var(--color-text-muted)] mt-0.5`}>{variantTitle}</p>
        )}
        {!compact && (
          <p className="text-sm text-[var(--color-text)] mt-1 font-medium">
            {formatJmd(unitPrice)}
          </p>
        )}
        <div className={`flex items-center justify-between gap-3 ${compact ? "mt-3" : "mt-auto pt-3"}`}>
          <div className={`inline-flex items-center border border-[var(--color-border)] rounded-md ${compact ? "h-7 text-xs" : "h-9 text-sm"}`}>
            <button
              type="button"
              onClick={() => onChangeQty(-1)}
              disabled={pending}
              className={`${compact ? "px-2" : "px-3"} h-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-40`}
              aria-label="Decrease"
            >
              −
            </button>
            <span className={`${compact ? "w-6" : "w-8"} text-center font-medium`}>{quantity}</span>
            <button
              type="button"
              onClick={() => onChangeQty(1)}
              disabled={pending}
              className={`${compact ? "px-2" : "px-3"} h-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-40`}
              aria-label="Increase"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={pending}
            className={`inline-flex items-center gap-1.5 ${compact ? "" : "text-sm"} text-[var(--color-text-muted)] hover:text-[var(--color-danger)] disabled:opacity-40 transition-colors`}
            aria-label="Remove"
          >
            <Trash size={compact ? 14 : 16} />
            {!compact && "Remove"}
          </button>
        </div>
      </div>
      <p className={`${compact ? "text-sm" : "text-base"} font-semibold whitespace-nowrap`}>
        {formatJmd(total)}
      </p>
    </li>
  );
}
