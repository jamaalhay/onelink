import { Star } from "@phosphor-icons/react/dist/ssr";
import type { Product } from "@/lib/types";
import { formatRating } from "@/lib/format";

interface ReviewSummaryProps {
  product: Product;
}

// Mock distribution — proportional to total review count
function distribution(total: number, rating: number) {
  // Skew toward the rounded rating
  const r = Math.round(rating);
  const weights: Record<number, number> = {
    5: r === 5 ? 0.78 : r === 4 ? 0.42 : 0.18,
    4: r === 5 ? 0.16 : r === 4 ? 0.4 : 0.22,
    3: 0.04,
    2: 0.015,
    1: 0.005,
  };
  return [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: Math.round(total * weights[stars]),
    pct: weights[stars] * 100,
  }));
}

const HIGHLIGHT_REVIEW = {
  title: "Exactly what was promised.",
  body:
    "Showed up in 22 minutes, sealed and discreet. Flavor is clean and the device feels solid for the price. Will reorder.",
  author: "Andre M.",
  area: "New Kingston",
  date: "April 2026",
  verified: true,
};

export function ReviewSummary({ product }: ReviewSummaryProps) {
  const dist = distribution(product.reviewCount, product.rating);

  return (
    <section className="grid lg:grid-cols-[20rem_1fr] gap-8 lg:gap-12 mt-12">
      {/* Left — rating + distribution */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-3">
          Customer reviews
        </p>
        <div className="flex items-baseline gap-3 mb-2">
          <p className="text-5xl font-semibold leading-none">{formatRating(product.rating)}</p>
          <div className="flex gap-0.5 text-[var(--color-warning)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                weight={i < Math.round(product.rating) ? "fill" : "regular"}
                className={i < Math.round(product.rating) ? "" : "text-[var(--color-border-strong)]"}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          Based on {product.reviewCount} reviews
        </p>
        <ul className="space-y-2">
          {dist.map((d) => (
            <li key={d.stars} className="flex items-center gap-3 text-sm">
              <span className="w-3 text-right text-[var(--color-text-muted)]">{d.stars}</span>
              <Star size={12} weight="fill" className="text-[var(--color-warning)]" />
              <div className="flex-1 h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--color-text)] rounded-full"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs text-[var(--color-text-muted)] tabular-nums">
                {d.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Right — highlighted review */}
      <figure className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 bg-[var(--color-bg)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Highlighted review
          </p>
          {HIGHLIGHT_REVIEW.verified && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-0.5 rounded">
              Verified buyer
            </span>
          )}
        </div>
        <div className="flex gap-0.5 text-[var(--color-warning)] mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} weight="fill" />
          ))}
        </div>
        <h4 className="text-base font-semibold mb-2">{HIGHLIGHT_REVIEW.title}</h4>
        <blockquote className="text-base text-[var(--color-text)] leading-relaxed">
          &ldquo;{HIGHLIGHT_REVIEW.body}&rdquo;
        </blockquote>
        <figcaption className="text-sm text-[var(--color-text-muted)] mt-4">
          {HIGHLIGHT_REVIEW.author} · {HIGHLIGHT_REVIEW.area} · {HIGHLIGHT_REVIEW.date}
        </figcaption>
      </figure>
    </section>
  );
}
