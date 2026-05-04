import Link from "next/link";

interface InfoPageProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
}

// Shared shell for the static info pages (FAQ, About, Shipping, etc.)
// Kept simple — single-column prose with back-to-home link.
export function InfoPage({ eyebrow, title, intro, children }: InfoPageProps) {
  return (
    <article className="mx-auto max-w-2xl px-4 lg:px-10 py-12 lg:py-16">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-3">{title}</h1>
      {intro && (
        <p className="text-base text-[var(--color-text-muted)] mb-10 leading-relaxed">{intro}</p>
      )}
      <div className="space-y-10 text-[15px] leading-relaxed text-[var(--color-text)]">
        {children}
      </div>
      <div className="mt-16 pt-8 border-t border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">
        Need something not covered here?{" "}
        <Link href="/contact" className="underline">
          Contact us
        </Link>{" "}
        or message us on WhatsApp from any page.
      </div>
    </article>
  );
}

export function InfoSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-3">{heading}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
