"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS, type SortKey } from "@/lib/shop-filtering";

interface SortSelectProps {
  value: SortKey;
}

export function SortSelect({ value }: SortSelectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <select
      name="sort"
      value={value}
      onChange={(event) => {
        const params = new URLSearchParams(searchParams.toString());
        const next = event.target.value;
        if (next === "popular") {
          params.delete("sort");
        } else {
          params.set("sort", next);
        }
        params.delete("page");
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      }}
      className="h-9 px-3 pr-8 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
