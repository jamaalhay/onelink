import Link from "next/link";
import { User } from "@phosphor-icons/react/dist/ssr";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { TrustStrip } from "@/components/site/trust-strip";

export const metadata = {
  title: "Account",
  description: "Onelink account and order help.",
};

export default function AccountPage() {
  return (
    <>
      <section className="mx-auto max-w-xl px-4 py-20 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-alt)] text-[var(--color-accent)]">
          <User size={26} weight="duotone" />
        </div>
        <p className="eyebrow mb-2">Account</p>
        <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight">Order accounts are coming soon.</h1>
        <p className="mt-4 text-sm text-[var(--color-text-muted)] leading-relaxed">
          For MVP, checkout stays guest-first so ordering is fast. Use your confirmation link
          to track an order, or message support and we&apos;ll help recover the link.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/track"
            className="h-11 inline-flex items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-accent-bg)] px-5 text-white font-medium hover:bg-[var(--color-accent-bg-hover)]"
          >
            Track an order
          </Link>
          <Link
            href="/shop"
            className="h-11 inline-flex items-center justify-center rounded-[var(--radius-button)] border border-[var(--color-border)] px-5 font-medium hover:bg-[var(--color-surface)]"
          >
            Continue shopping
          </Link>
        </div>
      </section>
      <WhatsAppCta message="Hi Onelink, I need help finding an order." />
      <TrustStrip />
    </>
  );
}
