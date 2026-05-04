import { Check } from "@phosphor-icons/react/dist/ssr";

const steps = ["Information", "Delivery", "Payment", "Review"] as const;
type Step = (typeof steps)[number];

interface CheckoutStepperProps {
  current: Step;
}

export function CheckoutStepper({ current }: CheckoutStepperProps) {
  const idx = steps.indexOf(current);

  return (
    <ol className="flex items-center gap-2 lg:gap-4 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
      {steps.map((s, i) => {
        const completed = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="flex items-center gap-3 shrink-0">
            <span
              className={
                completed || active
                  ? "inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-accent-bg)] text-white text-sm font-semibold"
                  : "inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-[var(--color-border-strong)] text-[var(--color-text-dim)] text-sm font-semibold"
              }
            >
              {completed ? <Check size={14} weight="bold" /> : i + 1}
            </span>
            <span
              className={
                active
                  ? "text-sm font-medium text-[var(--color-text)]"
                  : "text-sm text-[var(--color-text-muted)]"
              }
            >
              {s}
            </span>
            {i < steps.length - 1 && (
              <span className="hidden sm:block w-8 lg:w-16 h-px bg-[var(--color-border)] ml-1" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
