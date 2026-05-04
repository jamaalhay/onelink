"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle } from "@phosphor-icons/react/dist/ssr";

interface ReviewSubmitFormProps {
  productSlug: string;
  productTitle: string;
}

export function ReviewSubmitForm({ productSlug, productTitle }: ReviewSubmitFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1) return setError("Please pick a rating from 1 to 5.");
    if (name.trim().length < 2) return setError("Please add your name.");
    if (body.trim().length < 10) return setError("Tell us a bit more — at least 10 characters.");

    startTransition(async () => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productSlug)}/reviews`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating,
            title: title.trim() || undefined,
            body: body.trim(),
            customer_name: name.trim(),
            customer_email: email.trim() || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          setError(data.error ?? `Submission failed (${res.status})`);
          return;
        }
        setDone(true);
        // Reset for the next reviewer.
        setRating(0);
        setName("");
        setEmail("");
        setTitle("");
        setBody("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Submission failed");
      }
    });
  };

  if (done) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/5 p-5 flex items-start gap-3">
        <CheckCircle size={22} weight="fill" className="text-[var(--color-success)] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">Thanks for the review.</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            It&apos;ll show up here in a moment.
          </p>
          <button
            type="button"
            onClick={() => setDone(false)}
            className="mt-2 text-xs font-medium text-[var(--color-accent)] hover:underline"
          >
            Write another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 space-y-4"
    >
      <div>
        <h3 className="text-base font-semibold">Write a review</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          Share your experience with the {productTitle}.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-[var(--color-text)] block mb-1.5">Rating</label>
        <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hoverRating || rating);
            return (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="p-1 -m-1 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  weight={filled ? "fill" : "regular"}
                  className={filled ? "text-[var(--color-warning)]" : "text-[var(--color-border-strong)]"}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            className="w-full h-10 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">
            Email (optional)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="For verified-buyer badge"
            className="w-full h-10 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">
          Title <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
        </span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sums up your experience in a few words"
          maxLength={120}
          className="w-full h-10 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">Your review</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="What stood out — flavor, build, delivery, anything you'd want others to know."
          className="w-full px-3 py-2 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 resize-none"
        />
      </label>

      {error && (
        <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/30 rounded-[var(--radius-button)] p-3">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius-button)] bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-white font-medium transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Submitting…" : "Post review"}
        </button>
      </div>
    </form>
  );
}
