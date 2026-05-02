"use client";

import { useState } from "react";
import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";

export function QuantityPicker() {
  const [qty, setQty] = useState(1);
  return (
    <div className="inline-flex items-center border border-[var(--color-border)] rounded-[var(--radius-button)] h-12">
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        className="px-3 h-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors disabled:opacity-30"
        disabled={qty <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      <span className="w-10 text-center text-base font-medium text-[var(--color-text)]" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty((q) => q + 1)}
        className="px-3 h-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
