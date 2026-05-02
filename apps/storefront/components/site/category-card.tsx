import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/shop/${category.slug}`}
      className="group flex flex-col items-center gap-3 p-5 rounded-[var(--radius-card)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] transition-colors"
    >
      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[var(--color-bg-alt)]">
        <Image
          src={category.imageUrl}
          alt={category.name}
          fill
          sizes="80px"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          unoptimized
        />
      </div>
      <p className="text-sm font-medium text-[var(--color-text)] text-center">
        {category.shortLabel}
      </p>
    </Link>
  );
}
