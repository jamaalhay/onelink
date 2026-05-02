"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass } from "@phosphor-icons/react/dist/ssr";

interface Route {
  href: string;
  label: string;
  match: (p: string) => boolean;
}

const routes: Route[] = [
  { href: "/", label: "Home", match: (p) => p === "/" },
  { href: "/shop", label: "Shop", match: (p) => p === "/shop" },
  { href: "/shop/vapes", label: "Category", match: (p) => /^\/shop\/[^/]+$/.test(p) },
  { href: "/products/vuse-go-1000-grape-ice", label: "PDP", match: (p) => p.startsWith("/products/") },
  { href: "/cart", label: "Cart", match: (p) => p === "/cart" },
  { href: "/checkout", label: "Checkout", match: (p) => p === "/checkout" },
  { href: "/order/ord_demo_001/success", label: "Confirmation", match: (p) => p.includes("/success") },
  { href: "/track/ord_demo_001", label: "Tracking", match: (p) => p.startsWith("/track") },
];

/**
 * Dev-only demo nav. Pinned at the top above the delivery bar so chips never
 * overlap site content and are always visibly clickable.
 */
export function DemoNav() {
  const pathname = usePathname() ?? "/";

  return (
    <div
      id="onelink-demo-nav"
      style={{ position: "relative", zIndex: 100 }}
      className="pointer-events-auto bg-[#FBE9C2] text-[#5C4612] border-b border-[#F0CB7A]"
    >
      <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium uppercase tracking-[0.06em] mr-1">
          <Compass size={13} weight="duotone" />
          Demo
        </span>
        {routes.map((r, i) => {
          const on = r.match(pathname);
          return (
            <span key={r.href} className="inline-flex items-center gap-3">
              <Link
                href={r.href}
                className={
                  on
                    ? "font-semibold text-[#5C4612] underline underline-offset-4"
                    : "text-[#5C4612]/80 hover:text-[#5C4612] hover:underline underline-offset-4 transition-colors"
                }
              >
                {r.label}
              </Link>
              {i < routes.length - 1 && <span className="text-[#5C4612]/40">·</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}
