import { WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { whatsappLink } from "@/lib/whatsapp";

interface WhatsAppCtaProps {
  message?: string;
  variant?: "strip" | "inline";
}

export function WhatsAppCta({ message, variant = "strip" }: WhatsAppCtaProps) {
  const href = whatsappLink({ message });

  if (variant === "inline") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-whatsapp)] transition-colors"
      >
        <WhatsappLogo size={20} weight="fill" className="text-[var(--color-whatsapp)]" />
        Chat on WhatsApp
      </a>
    );
  }

  return (
    <section className="bg-[var(--color-bg-alt)] border-y border-[var(--color-border)]">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center md:text-left">
          <WhatsappLogo
            size={36}
            weight="fill"
            className="text-[var(--color-whatsapp)] shrink-0"
          />
          <div>
            <p className="text-base font-medium text-[var(--color-text)]">
              Need help or want to order via WhatsApp?
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Chat with our team for product help and assisted orders.
            </p>
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-button)] bg-[var(--color-whatsapp)] hover:opacity-90 text-white font-medium transition-opacity active:scale-[0.98]"
        >
          <WhatsappLogo size={18} weight="fill" />
          Chat on WhatsApp
        </a>
      </div>
    </section>
  );
}
