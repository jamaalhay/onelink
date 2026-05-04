"use client";

import Link from "next/link";
import { ShoppingBag } from "@phosphor-icons/react/dist/ssr";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { formatJmd } from "@/lib/format";
import { CartLineItem } from "@/components/site/cart-line-item";
import { useCart } from "@/lib/cart/use-cart";

/**
 * Header cart icon — opens a slide-out mini-cart drawer.
 * Reads cart state via SWR so navigation back to a page doesn't trigger
 * a fresh server-side cart fetch in the layout.
 */
export function CartDrawer() {
  const { cart, itemCount } = useCart();
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const shipping = cart?.shipping_total ?? 0;
  const total = cart?.total ?? subtotal;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open cart"
            className="relative p-2.5 hover:bg-[var(--color-surface)] rounded-md transition-colors"
          />
        }
      >
        <ShoppingBag size={20} />
        {itemCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-accent-bg)] text-white text-[10px] font-semibold">
            {itemCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        className="w-full sm:max-w-md flex flex-col p-0 bg-[var(--color-bg)] text-[var(--color-text)]"
        showCloseButton={false}
      >
        <header className="flex items-center justify-between px-6 h-16 border-b border-[var(--color-border)]">
          <div>
            <SheetTitle className="text-base font-semibold tracking-tight">Your cart</SheetTitle>
            <SheetDescription className="text-xs text-[var(--color-text-muted)]">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </SheetDescription>
          </div>
        </header>

        {itemCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={32} className="text-[var(--color-text-dim)] mb-3" />
            <p className="text-sm text-[var(--color-text-muted)]">Your cart is empty.</p>
            <Link
              href="/shop"
              className="mt-5 inline-flex items-center h-10 px-4 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm font-medium hover:bg-[var(--color-surface)]"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
              {items.map((it) => (
                <CartLineItem
                  key={it.id}
                  id={it.id}
                  productHandle={it.product_handle ?? ""}
                  productTitle={it.product_title ?? "Item"}
                  variantTitle={it.variant_title}
                  thumbnail={it.thumbnail}
                  unitPrice={it.unit_price ?? 0}
                  quantity={it.quantity ?? 0}
                  total={it.total ?? 0}
                  size="drawer"
                />
              ))}
            </ul>

            <footer className="border-t border-[var(--color-border)] p-6 space-y-3">
              <SummaryRow label="Subtotal" value={formatJmd(subtotal)} />
              {shipping > 0 ? (
                <SummaryRow label="Delivery" value={formatJmd(shipping)} />
              ) : (
                <SummaryRow label="Delivery" value="Set at checkout" />
              )}
              <div className="flex items-baseline justify-between pt-3 mt-3 border-t border-[var(--color-border)]">
                <p className="text-sm font-medium">Total</p>
                <p className="text-xl font-semibold">{formatJmd(total)}</p>
              </div>
              <SheetClose
                render={
                  <Link
                    href="/checkout"
                    className="mt-1 h-11 w-full inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-white text-sm font-medium transition-colors"
                  />
                }
              >
                <ShoppingBag size={16} weight="bold" />
                Proceed to Checkout
              </SheetClose>
              <SheetClose
                render={
                  <Link
                    href="/cart"
                    className="block text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  />
                }
              >
                View full cart →
              </SheetClose>
            </footer>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="text-[var(--color-text)] font-medium">{value}</span>
    </div>
  );
}
