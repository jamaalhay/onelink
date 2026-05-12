"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { List, User, X } from "@phosphor-icons/react/dist/ssr";

interface MobileMenuProps {
  links: { href: string; label: string }[];
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden p-2 -ml-2 text-[var(--color-text)]"
        aria-label="Open menu"
        aria-expanded={open}
      >
        <List size={24} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/35"
            onClick={() => setOpen(false)}
          />
          <nav className="relative w-[min(20rem,calc(100vw-3rem))] h-full bg-[var(--color-bg)] border-r border-[var(--color-border)] shadow-xl px-5 py-5 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-md hover:bg-[var(--color-surface)]"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <div className="py-4 divide-y divide-[var(--color-border)]">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-base font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="mt-auto inline-flex items-center gap-2 h-11 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] font-medium"
            >
              <User size={18} />
              Account
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
