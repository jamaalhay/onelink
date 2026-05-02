"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const COOKIE = "onelink_age_ok";

function readGate(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`));
}

function setGate() {
  if (typeof document === "undefined") return;
  // 30-day cookie
  const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE}=1; expires=${exp}; path=/; samesite=lax`;
}

/**
 * Age gate modal. Shown on first visit if no cookie set.
 * DESIGN.md §9 · Age Gate Modal.
 */
export function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!readGate()) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
      className="fixed inset-0 z-50 bg-[rgb(32_36_44_/_0.6)] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[420px] bg-[var(--color-bg)] rounded-[var(--radius-modal)] p-8 flex flex-col items-center text-center gap-5">
        <Image
          src="/brand/favicon-512.png"
          alt="Onelink"
          width={72}
          height={24}
        />
        <div className="flex flex-col gap-2">
          <h2 id="age-gate-title" className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
            Are you 18 or older?
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Onelink sells age-restricted products including vapes, nicotine pouches,
            and rolling papers. By entering, you confirm you are of legal age in
            your jurisdiction.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={() => {
              setGate();
              setVisible(false);
            }}
            className="flex-1 h-11 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-colors active:scale-[0.98]"
          >
            Yes, I&apos;m 18+
          </button>
          <a
            href="https://www.google.com"
            className="flex-1 h-11 inline-flex items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-[var(--color-text)] font-medium transition-colors"
          >
            No, exit
          </a>
        </div>
        <p className="text-[11px] text-[var(--color-text-dim)] mt-1">
          We use a cookie to remember your confirmation.
        </p>
      </div>
    </div>
  );
}
