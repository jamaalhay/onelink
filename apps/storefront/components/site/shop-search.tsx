import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

interface ShopSearchProps {
  defaultValue?: string;
}

// GET-form search box. Submitting navigates to /shop?q=… which the shop page
// reads from searchParams to filter products. Plain HTML form keeps it
// progressive — works without JS and there's no client hydration cost.
export function ShopSearch({ defaultValue }: ShopSearchProps) {
  return (
    <form action="/shop" method="get" className="relative max-w-md w-full">
      <MagnifyingGlass
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search products, categories, brands"
        className="w-full h-11 pl-10 pr-3 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg)] text-sm placeholder:text-[var(--color-text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
      />
    </form>
  );
}
