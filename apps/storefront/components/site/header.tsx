import Link from "next/link";
import Image from "next/image";
import { User, List } from "@phosphor-icons/react/dist/ssr";
import { SearchDialog } from "@/components/site/search-dialog";
import { CartDrawer } from "@/components/site/cart-drawer";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/vapes", label: "Categories" },
  { href: "/deals", label: "Deals" },
  { href: "/track", label: "Track Order" },
  { href: "/about", label: "About" },
];

// Header stays a Server Component but no longer fetches the cart — the
// CartDrawer is a Client Component that pulls cart state via SWR. This
// removes a Medusa round-trip from every layout render.
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-10 h-[72px] flex items-center justify-between gap-6">
        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 -ml-2 text-[var(--color-text)]"
          aria-label="Open menu"
        >
          <List size={24} />
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center" aria-label="Onelink home">
          <Image
            src="/brand/lockup-color.png"
            alt="Onelink"
            width={140}
            height={54}
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text)]">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hover:text-[var(--color-accent)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1 text-[var(--color-text)]">
          <SearchDialog />
          <Link
            href="/account"
            className="hidden sm:flex p-2.5 hover:bg-[var(--color-surface)] rounded-md transition-colors"
            aria-label="Account"
          >
            <User size={20} />
          </Link>
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
