import { categories } from "@/lib/mock/categories";

/**
 * Static filter sidebar used on shop pages. Wires to URL params in a future task —
 * this MVP renders the visual structure to match the mockup.
 */
export function FilterSidebar() {
  return (
    <aside className="w-full lg:w-60 shrink-0 space-y-6">
      <FilterGroup label="Category">
        {categories.map((c) => (
          <FilterCheckbox key={c.slug} label={c.shortLabel} count={5} />
        ))}
      </FilterGroup>
      <FilterGroup label="Brand">
        {["Elf Bar", "Vuse", "ZYN", "Bic", "Clipper", "RAW", "OCB", "Red Bull", "Ting"].map((b) => (
          <FilterCheckbox key={b} label={b} count={3} />
        ))}
      </FilterGroup>
      <FilterGroup label="Price (JMD)">
        <PriceBucket label="Under $500" />
        <PriceBucket label="$500 – $1,000" />
        <PriceBucket label="$1,000 – $2,000" />
        <PriceBucket label="$2,000 – $5,000" />
        <PriceBucket label="$5,000 +" />
      </FilterGroup>
      <FilterGroup label="Availability">
        <FilterCheckbox label="In stock" count={14} />
        <FilterCheckbox label="On sale" count={3} />
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-3">
        {label}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({ label, count }: { label: string; count: number }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-[var(--color-text)] cursor-pointer hover:text-[var(--color-accent)] transition-colors">
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-[var(--color-border-strong)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
      />
      <span className="flex-1">{label}</span>
      <span className="text-xs text-[var(--color-text-dim)]">({count})</span>
    </label>
  );
}

function PriceBucket({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-[var(--color-text)] cursor-pointer hover:text-[var(--color-accent)] transition-colors">
      <input
        type="radio"
        name="price"
        className="w-4 h-4 border-[var(--color-border-strong)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-0"
      />
      <span className="flex-1">{label}</span>
    </label>
  );
}
