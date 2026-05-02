"use client";

import { useState } from "react";
import type { ProductVariant } from "@/lib/types";

interface VariantPickerProps {
  variants: ProductVariant[];
  label?: string;
}

export function VariantPicker({ variants, label = "Variant" }: VariantPickerProps) {
  const [selected, setSelected] = useState(variants.find((v) => v.available)?.id);

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-[var(--color-text)]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const on = v.id === selected;
          if (!v.available) {
            return (
              <span
                key={v.id}
                className="inline-flex items-center h-10 px-4 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-dim)] text-sm line-through cursor-not-allowed"
              >
                {v.label}
              </span>
            );
          }
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setSelected(v.id)}
              className={
                on
                  ? "inline-flex items-center h-10 px-4 rounded-[var(--radius-button)] border-2 border-[var(--color-accent)] text-[var(--color-text)] text-sm font-medium"
                  : "inline-flex items-center h-10 px-4 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] text-[var(--color-text)] text-sm font-medium transition-colors"
              }
            >
              {v.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
