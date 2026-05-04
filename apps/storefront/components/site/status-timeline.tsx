import { Check } from "@phosphor-icons/react/dist/ssr";
import { orderStateOrder, orderStateLabels } from "@/lib/mock/orders";
import type { OrderState } from "@/lib/types";

interface StatusTimelineProps {
  current: OrderState;
}

export function StatusTimeline({ current }: StatusTimelineProps) {
  const idx = orderStateOrder.indexOf(current);

  return (
    <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {orderStateOrder.map((state, i) => {
        const completed = i < idx;
        const active = i === idx;
        return (
          <li key={state} className="flex flex-col items-start gap-2">
            <span
              className={
                completed
                  ? "inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-accent-bg)]/70 text-white"
                  : active
                    ? "inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-accent-bg)] text-white"
                    : "inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-[var(--color-border-strong)] text-[var(--color-text-dim)] text-sm font-semibold"
              }
            >
              {completed || active ? <Check size={14} weight="bold" /> : i + 1}
            </span>
            <p
              className={
                active
                  ? "text-sm font-medium text-[var(--color-text)]"
                  : completed
                    ? "text-sm text-[var(--color-text)]"
                    : "text-sm text-[var(--color-text-muted)]"
              }
            >
              {orderStateLabels[state]}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
