import Link from "next/link";
import { categories } from "@/lib/mock/categories";

interface CategoryChipsProps {
  active?: string;
}

export function CategoryChips({ active }: CategoryChipsProps) {
  const isAll = !active;
  return (
    <nav className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <Link
        href="/shop"
        className={
          isAll
            ? "inline-flex items-center h-9 px-4 rounded-full bg-[var(--color-text)] text-white text-sm font-medium whitespace-nowrap"
            : "inline-flex items-center h-9 px-4 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text)] text-sm font-medium whitespace-nowrap transition-colors"
        }
      >
        All Products
      </Link>
      {categories.map((c) => {
        const on = c.slug === active;
        return (
          <Link
            key={c.slug}
            href={`/shop/${c.slug}`}
            className={
              on
                ? "inline-flex items-center h-9 px-4 rounded-full bg-[var(--color-text)] text-white text-sm font-medium whitespace-nowrap"
                : "inline-flex items-center h-9 px-4 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text)] text-sm font-medium whitespace-nowrap transition-colors"
            }
          >
            {c.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}
