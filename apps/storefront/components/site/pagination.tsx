import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

interface PaginationProps {
  current: number;
  total: number;
  basePath?: string;
  query?: Record<string, string>;
}

export function Pagination({ current, total, basePath = "/shop", query = {} }: PaginationProps) {
  if (total <= 1) return null;

  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const previous = Math.max(1, current - 1);
  const next = Math.min(total, current + 1);

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
      {current === 1 ? (
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] opacity-40"
          aria-label="Previous page"
        >
          <CaretLeft size={14} />
        </span>
      ) : (
        <Link
          href={pageHref(basePath, query, previous)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
          aria-label="Previous page"
        >
          <CaretLeft size={14} />
        </Link>
      )}
      {pages.map((p) => {
        const on = p === current;
        return (
          <Link
            key={p}
            href={pageHref(basePath, query, p)}
            className={
              on
                ? "inline-flex items-center justify-center w-9 h-9 rounded-md bg-[var(--color-text)] text-white text-sm font-medium"
                : "inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium transition-colors"
            }
            aria-current={on ? "page" : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </Link>
        );
      })}
      {current === total ? (
        <span
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] opacity-40"
          aria-label="Next page"
        >
          <CaretRight size={14} />
        </span>
      ) : (
        <Link
          href={pageHref(basePath, query, next)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
          aria-label="Next page"
        >
          <CaretRight size={14} />
        </Link>
      )}
    </nav>
  );
}

function pageHref(basePath: string, query: Record<string, string>, page: number) {
  const params = new URLSearchParams(query);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
