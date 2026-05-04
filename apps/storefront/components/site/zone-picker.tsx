"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CaretDown, MapPin } from "@phosphor-icons/react/dist/ssr";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { zones } from "@/lib/mock/zones";
import { formatEtaRange, formatJmd } from "@/lib/format";

interface ZonePickerProps {
  currentSlug: string;
}

const ZONE_COOKIE = "onelink_zone";

function setZoneCookie(slug: string) {
  // 30-day persistence; samesite=lax keeps it on most navigations.
  const exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${ZONE_COOKIE}=${encodeURIComponent(slug)}; expires=${exp}; path=/; samesite=lax`;
}

// "Change" affordance on the top delivery bar — opens a dialog listing all
// 10 Kingston zones. Selection persists in a cookie that the server reads
// to pick the default zone for the bar's ETA + checkout pre-selection.
export function ZonePicker({ currentSlug }: ZonePickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSelect = (slug: string) => {
    setZoneCookie(slug);
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="text-white/80 hover:text-white text-xs font-medium uppercase tracking-wider transition-colors inline-flex items-center gap-1"
          />
        }
      >
        Change
        <CaretDown size={11} weight="bold" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Pick your delivery zone</DialogTitle>
        <DialogDescription>
          We deliver across 10 Kingston neighborhoods. ETA and fee update based on
          where you are.
        </DialogDescription>
        <ul className="mt-1 max-h-[60vh] overflow-y-auto -mx-1 divide-y divide-[var(--color-border)]">
          {zones.map((z) => {
            const active = z.slug === currentSlug;
            return (
              <li key={z.slug}>
                <button
                  type="button"
                  onClick={() => handleSelect(z.slug)}
                  disabled={pending}
                  className={
                    active
                      ? "w-full flex items-center justify-between gap-3 px-3 py-3 text-left bg-[var(--color-accent)]/5"
                      : "w-full flex items-center justify-between gap-3 px-3 py-3 text-left hover:bg-[var(--color-surface)] transition-colors"
                  }
                >
                  <span className="flex items-center gap-2.5">
                    <MapPin
                      size={16}
                      weight={active ? "fill" : "regular"}
                      className={active ? "text-[var(--color-accent)]" : "text-[var(--color-text-muted)]"}
                    />
                    <span>
                      <span className={active ? "text-sm font-semibold text-[var(--color-text)] block" : "text-sm font-medium text-[var(--color-text)] block"}>
                        {z.name}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] mt-0.5 block">
                        {formatEtaRange(z.etaMin, z.etaMax)} · {formatJmd(z.feeJmd)}
                      </span>
                    </span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {z.band}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
