import { Star } from "@phosphor-icons/react/dist/ssr";
import type { Product } from "@/lib/types";
import type { ReviewsPayload } from "@/lib/medusa/reviews";
import { ReviewSubmitForm } from "./review-submit-form";

interface ReviewSummaryProps {
  product: Product;
  data: ReviewsPayload;
}

export function ReviewSummary({ product, data }: ReviewSummaryProps) {
  const { reviews, summary } = data;
  const total = summary.count;
  const avg = summary.average;
  const dist = summary.distribution.map((d) => ({
    stars: d.stars,
    count: d.count,
    pct: total > 0 ? (d.count / total) * 100 : 0,
  }));

  const featured = reviews[0] ?? null;

  return (
    <section className="grid lg:grid-cols-[20rem_1fr] gap-8 lg:gap-12 mt-12">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-3">
          Customer reviews
        </p>
        <div className="flex items-baseline gap-3 mb-2">
          <p className="text-5xl font-semibold leading-none">
            {total > 0 ? avg.toFixed(1) : "—"}
          </p>
          <div className="flex gap-0.5 text-[var(--color-warning)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                weight={i < Math.round(avg) ? "fill" : "regular"}
                className={i < Math.round(avg) ? "" : "text-[var(--color-border-strong)]"}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6">
          {total === 0 ? "No reviews yet" : `Based on ${total} review${total === 1 ? "" : "s"}`}
        </p>
        {total > 0 && (
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
        )}
      </div>

      <div className="space-y-6">
        {featured ? (
          <figure className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 bg-[var(--color-bg)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Latest review
              </p>
              {featured.is_verified && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-success)] bg-[var(--color-success)]/10 px-2 py-0.5 rounded">
                  Verified buyer
                </span>
              )}
            </div>
            <div className="flex gap-0.5 text-[var(--color-warning)] mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  weight={i < featured.rating ? "fill" : "regular"}
                  className={i < featured.rating ? "" : "text-[var(--color-border-strong)]"}
                />
              ))}
            </div>
            {featured.title && (
              <h3 className="text-base font-semibold mb-2">{featured.title}</h3>
            )}
            <blockquote className="text-base text-[var(--color-text)] leading-relaxed">
              &ldquo;{featured.body}&rdquo;
            </blockquote>
            <figcaption className="text-sm text-[var(--color-text-muted)] mt-4">
              {featured.customer_name} ·{" "}
              {new Date(featured.created_at).toLocaleDateString("en-JM", {
                month: "long",
                year: "numeric",
              })}
            </figcaption>
          </figure>
        ) : (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] p-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              Be the first to review the {product.title}.
            </p>
          </div>
        )}

        <ReviewSubmitForm productSlug={product.slug} productTitle={product.title} />

        {reviews.length > 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">More reviews</h3>
            <ul className="space-y-4">
              {reviews.slice(1, 6).map((r) => (
                <li key={r.id} className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex gap-0.5 text-[var(--color-warning)]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          weight={i < r.rating ? "fill" : "regular"}
                          className={i < r.rating ? "" : "text-[var(--color-border-strong)]"}
                        />
                      ))}
                    </div>
                    {r.is_verified && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-success)]">
                        Verified
                      </span>
                    )}
                  </div>
                  {r.title && <p className="text-sm font-semibold mb-1">{r.title}</p>}
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">{r.body}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    {r.customer_name} · {new Date(r.created_at).toLocaleDateString("en-JM")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
