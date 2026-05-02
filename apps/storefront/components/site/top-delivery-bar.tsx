import { MapPin, Clock } from "@phosphor-icons/react/dist/ssr";
import { defaultZone } from "@/lib/mock/zones";
import { formatEtaRange } from "@/lib/format";

/**
 * Persistent context strip — shows active delivery zone and ETA.
 * DESIGN.md §9 · Top Delivery Bar.
 */
export function TopDeliveryBar() {
  const { name, etaMin, etaMax } = defaultZone;
  return (
    <div className="section-dark text-sm">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-10 h-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-white/90">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} weight="fill" className="text-white/80" />
            Delivering to <strong className="font-medium text-white">{name}</strong>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-white/70">
            <Clock size={14} className="text-white/70" />
            ETA <strong className="font-medium text-white/90">{formatEtaRange(etaMin, etaMax)}</strong>
          </span>
        </div>
        <button
          type="button"
          className="text-white/80 hover:text-white text-xs font-medium uppercase tracking-wider transition-colors"
        >
          Change
        </button>
      </div>
    </div>
  );
}
