import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";

interface PaginationProps {
  current: number;
  total: number;
}

/**
 * Visual pagination control. Static for MVP — wires to URL params later.
 */
export function Pagination({ current, total }: PaginationProps) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
      <button
        type="button"
        disabled={current === 1}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <CaretLeft size={14} />
      </button>
      {pages.map((p) => {
        const on = p === current;
        return (
          <button
            key={p}
            type="button"
            className={
              on
                ? "inline-flex items-center justify-center w-9 h-9 rounded-md bg-[var(--color-text)] text-white text-sm font-medium"
                : "inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text)] text-sm font-medium transition-colors"
            }
            aria-current={on ? "page" : undefined}
            aria-label={`Page ${p}`}
          >
            {p}
          </button>
        );
      })}
      <button
        type="button"
        disabled={current === total}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-surface)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <CaretRight size={14} />
      </button>
    </nav>
  );
}
