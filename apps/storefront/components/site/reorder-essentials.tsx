import Link from "next/link";
import Image from "next/image";
import { ArrowClockwise } from "@phosphor-icons/react/dist/ssr";
import { fetchProducts } from "@/lib/medusa/server";
import { formatJmd } from "@/lib/format";

const REORDER_HANDLES = [
  "zyn-cool-mint-6mg",
  "bic-classic-lighter-blue",
  "ting-grapefruit-355ml",
];

/**
 * Post-purchase reorder strip. Shows commonly ordered staples with one-tap
 * reorder. PRD §7.2 "What is next" panel.
 *
 * Server Component — pulls live product data from Medusa.
 */
export async function ReorderEssentials() {
  const { products } = await fetchProducts({ limit: 100 });
  const picks = REORDER_HANDLES
    .map((h) => products.find((p) => p.slug === h))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (picks.length === 0) return null;

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Reorder essentials
          </p>
          <h3 className="text-base font-semibold mt-1">Your usuals — one tap.</h3>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {picks.map((p) => (
          <li
            key={p.slug}
            className="flex items-center gap-3 p-3 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
          >
            <div className="relative w-12 h-14 bg-[var(--color-bg-alt)] rounded-md overflow-hidden shrink-0">
              <Image src={p.imageUrl} alt={p.title} fill sizes="48px" className="object-cover" unoptimized />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--color-text-muted)]">{p.brand}</p>
              <p className="text-sm font-medium leading-tight line-clamp-1">{p.title}</p>
              <p className="text-xs font-semibold mt-0.5">{formatJmd(p.priceJmd)}</p>
            </div>
            <Link
              href={`/products/${p.slug}`}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-white transition-colors"
              aria-label={`Reorder ${p.title}`}
            >
              <ArrowClockwise size={14} weight="bold" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
