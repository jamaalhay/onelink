import { cookies } from "next/headers";
import { MapPin, Clock } from "@phosphor-icons/react/dist/ssr";
import { defaultZone, findZone } from "@/lib/mock/zones";
import { formatEtaRange } from "@/lib/format";
import { ZonePicker } from "./zone-picker";

const ZONE_COOKIE = "onelink_zone";

/**
 * Persistent context strip — shows active delivery zone and ETA. The active
 * zone is read from the `onelink_zone` cookie set by ZonePicker; falls back
 * to the default zone on first visit.
 */
export async function TopDeliveryBar() {
  const c = await cookies();
  const cookieSlug = c.get(ZONE_COOKIE)?.value;
  const zone = (cookieSlug && findZone(cookieSlug)) || defaultZone;

  return (
    <aside aria-label="Delivery zone" className="section-dark text-sm">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-10 h-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-white/90">
          <span className="flex items-center gap-1.5">
            <MapPin size={14} weight="fill" className="text-white/80" />
            Delivering to <strong className="font-medium text-white">{zone.name}</strong>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-white/70">
            <Clock size={14} className="text-white/70" />
            ETA <strong className="font-medium text-white/90">{formatEtaRange(zone.etaMin, zone.etaMax)}</strong>
          </span>
        </div>
        <ZonePicker currentSlug={zone.slug} />
      </div>
    </aside>
  );
}
