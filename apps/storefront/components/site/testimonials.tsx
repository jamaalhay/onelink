import { Star } from "@phosphor-icons/react/dist/ssr";
import { testimonials } from "@/lib/mock/testimonials";

export function Testimonials() {
  return (
    <section className="bg-[var(--color-bg-alt)] border-y border-[var(--color-border)]">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-16 lg:py-20">
        <div className="text-center mb-10">
          <p className="eyebrow mb-3">Trusted in Kingston</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight">
            What customers are saying.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="flex flex-col gap-4 p-6 bg-[var(--color-bg)] rounded-[var(--radius-card)] border border-[var(--color-border)]"
            >
              <div className="flex gap-0.5 text-[var(--color-warning)]">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} weight="fill" />
                ))}
              </div>
              <blockquote className="text-base text-[var(--color-text)] leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="text-sm">
                <p className="font-medium text-[var(--color-text)]">{t.name}</p>
                <p className="text-[var(--color-text-muted)]">{t.area}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
