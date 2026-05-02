import {
  Storefront,
  CheckCircle,
  Motorcycle,
  Package,
} from "@phosphor-icons/react/dist/ssr";

const steps = [
  { icon: Storefront, title: "Browse", body: "Pick from a curated catalog." },
  { icon: CheckCircle, title: "Order Confirmed", body: "Pay by card or cash on delivery." },
  { icon: Motorcycle, title: "Rider Dispatched", body: "We assign and dispatch fast." },
  { icon: Package, title: "Delivered", body: "At your door in 15–30 minutes." },
] as const;

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-16 lg:py-24">
      <div className="text-center mb-10 lg:mb-14">
        <p className="eyebrow mb-3">How OneLink works</p>
        <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight">
          From tap to door in four steps.
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold">
                {i + 1}
              </span>
              <Icon size={24} weight="duotone" className="text-[var(--color-accent)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
