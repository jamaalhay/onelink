import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

/**
 * Visible search input on the shop header — surfaced from the spec mockup
 * which shows the search prominent (not hidden behind an icon).
 */
export function ShopSearch() {
  return (
    <div className="relative max-w-md w-full">
      <MagnifyingGlass
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
      />
      <input
        type="search"
        placeholder="Search products, categories, brands"
        className="w-full h-11 pl-10 pr-3 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm placeholder:text-[var(--color-text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
      />
    </div>
  );
}
