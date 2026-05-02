import {
  ShieldCheck,
  Lock,
  Package,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

const trustItems = [
  { icon: ShieldCheck, label: "100% Authentic", note: "Sourced direct" },
  { icon: Lock, label: "Secure Checkout", note: "Card or COD" },
  { icon: Package, label: "Discreet Packaging", note: "Plain, sealed" },
  { icon: Sparkle, label: "Satisfaction", note: "Guaranteed" },
] as const;

export function TrustStrip() {
  return (
    <section className="bg-[var(--color-bg)] border-y border-[var(--color-border)]">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {trustItems.map(({ icon: Icon, label, note }) => (
          <div key={label} className="flex items-center gap-3">
            <Icon
              size={28}
              weight="duotone"
              className="text-[var(--color-accent)] shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-[var(--color-text)] leading-tight">
                {label}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] leading-tight mt-0.5">
                {note}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
