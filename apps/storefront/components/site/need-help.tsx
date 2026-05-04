"use client";

import { Question, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { whatsappLink } from "@/lib/whatsapp";
import { trackWhatsAppClick } from "@/lib/analytics";

interface NeedHelpProps {
  message?: string;
}

/**
 * "Need help" support card shown post-purchase. PRD §7 image 7 right column.
 */
export function NeedHelp({ message }: NeedHelpProps) {
  const wa = whatsappLink({ message });

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          <Question size={18} weight="duotone" />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
            Need help?
          </p>
          <h3 className="text-base font-semibold mt-0.5">We&apos;re a tap away.</h3>
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">
        Anything wrong with your order, change of plans, or just want a status update? Reach support or chat directly with our team.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] text-sm font-medium"
        >
          I need help
        </button>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick("need-help")}
          className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--color-whatsapp-bg)] hover:opacity-90 text-white text-sm font-medium transition-opacity"
        >
          <WhatsappLogo size={16} weight="fill" />
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}
