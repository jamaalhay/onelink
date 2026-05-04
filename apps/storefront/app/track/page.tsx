"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

export default function TrackIndex() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = input.trim();
    if (!value) {
      setError("Paste your order ID or tracking URL.");
      return;
    }

    // Accept either the full Medusa order_xxx id, or a tracking URL containing it.
    const match = value.match(/order_[A-Z0-9]+/i);
    if (!match) {
      setError("Couldn't find an order ID in that input. Paste the URL from your order confirmation, or the order_xxx id directly.");
      return;
    }
    router.push(`/track/${match[0]}`);
  };

  return (
    <section className="mx-auto max-w-md px-4 py-20">
      <p className="eyebrow mb-2">Track an order</p>
      <h1 className="text-3xl font-semibold tracking-tight mb-3">Where's my order?</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        Paste the order ID (or tracking URL) from your order confirmation. You can find it in the link we sent you after checkout.
      </p>

      <form onSubmit={handleLookup} className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">
            Order ID or tracking URL
          </span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="order_01KQKDN5JG6M24P6RPTYMYF617"
            className="w-full h-11 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
            autoFocus
          />
        </label>

        {error && (
          <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/30 rounded-[var(--radius-button)] p-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 h-12 px-6 rounded-[var(--radius-button)] bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-white font-medium transition-all active:scale-[0.98]"
        >
          <MagnifyingGlass size={16} weight="bold" />
          Track order
        </button>
      </form>

      <p className="mt-8 text-xs text-[var(--color-text-muted)] text-center">
        Lost the link? Message us on WhatsApp with your order number — we'll send it back.
      </p>
    </section>
  );
}
