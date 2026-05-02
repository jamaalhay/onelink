"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Landing page Stripe redirects to after 3DS authentication. Reads the
// payment_intent params, completes the order, and forwards to /order/.../success.
// Non-3DS card flows skip this entirely (Stripe.js stays in-page).
export default function CheckoutProcessing() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const status = params.get("redirect_status");

    (async () => {
      if (status === "failed") {
        setError("Payment failed. Please try again from checkout.");
        return;
      }
      if (status !== "succeeded") {
        setError(`Unexpected payment state: ${status ?? "unknown"}`);
        return;
      }
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_method: "card" }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok && data.orderId) {
          router.replace(`/order/${data.orderId}/success`);
        } else {
          setError(data.error ?? `Could not complete order (${res.status})`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not complete order");
      }
    })();
  }, [params, router]);

  return (
    <section className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
      {error ? (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Payment problem</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{error}</p>
          <a
            href="/checkout"
            className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] font-medium"
          >
            Back to checkout
          </a>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Confirming your payment…</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Hold tight — finishing up with the bank.
          </p>
        </>
      )}
    </section>
  );
}
