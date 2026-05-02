import Link from "next/link";
import Image from "next/image";
import { Star } from "@phosphor-icons/react/dist/ssr";
import type { Product } from "@/lib/types";
import { formatJmd, formatRating } from "@/lib/format";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryBadge = product.badges[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col h-full"
    >
      <div className="relative aspect-[4/5] bg-[var(--color-bg-alt)] rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={
            product.inStock
              ? "object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              : "object-cover opacity-60"
          }
          unoptimized
        />
        {primaryBadge && (
          <span className="absolute left-3 top-3 inline-flex items-center bg-[var(--color-text)] text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded">
            {primaryBadge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute left-3 top-3 inline-flex items-center bg-[var(--color-text-dim)] text-white text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
      </div>

      <div className="pt-3 flex flex-col gap-1.5">
        <p className="text-xs text-[var(--color-text-muted)]">{product.brand}</p>
        <h3 className="text-sm font-medium text-[var(--color-text)] leading-tight line-clamp-1">
          {product.title}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-base font-semibold text-[var(--color-text)]">
            {formatJmd(product.priceJmd)}
          </p>
          <span className="inline-flex items-center gap-0.5 text-xs text-[var(--color-text-muted)]">
            <Star size={12} weight="fill" className="text-[var(--color-warning)]" />
            {formatRating(product.rating)}
            <span className="text-[var(--color-text-dim)]">({product.reviewCount})</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
