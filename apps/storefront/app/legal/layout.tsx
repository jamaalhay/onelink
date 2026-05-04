import Link from "next/link";

const SECTIONS = [
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/age-policy", label: "Age Policy" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-[1100px] px-4 lg:px-10 py-12 grid lg:grid-cols-[14rem_1fr] gap-10">
      <nav className="hidden lg:block lg:sticky lg:top-28 lg:self-start space-y-1">
        <p className="eyebrow mb-4">Legal</p>
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] py-1.5"
          >
            {s.label}
          </Link>
        ))}
      </nav>
      <article className="prose-onelink max-w-2xl">{children}</article>
    </section>
  );
}
