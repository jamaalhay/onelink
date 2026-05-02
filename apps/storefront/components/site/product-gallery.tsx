"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  return (
    <div className="grid grid-cols-[5rem_1fr] gap-4 lg:gap-6">
      <div className="flex flex-col gap-2">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setActive(i)}
            className={
              i === active
                ? "relative aspect-square rounded-md border-2 border-[var(--color-accent)] overflow-hidden bg-[var(--color-bg-alt)]"
                : "relative aspect-square rounded-md border border-[var(--color-border)] hover:border-[var(--color-border-strong)] overflow-hidden bg-[var(--color-bg-alt)]"
            }
            aria-label={`View image ${i + 1}`}
          >
            <Image
              src={src}
              alt={`${alt} thumbnail ${i + 1}`}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized
            />
          </button>
        ))}
      </div>
      <div className="relative aspect-square w-full bg-[var(--color-bg-alt)] rounded-[var(--radius-card)] border border-[var(--color-border)] overflow-hidden">
        <Image
          src={main}
          alt={alt}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
          unoptimized
        />
      </div>
    </div>
  );
}
