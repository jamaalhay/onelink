import Image from "next/image";
import Link from "next/link";
import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Vapes", href: "/shop/vapes" },
      { label: "ZYN Pouches", href: "/shop/zyn-pouches" },
      { label: "Lighters", href: "/shop/lighters" },
      { label: "Accessories", href: "/shop/smoking-accessories" },
      { label: "Drinks", href: "/shop/drinks" },
      { label: "Snacks", href: "/shop/snacks" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Track Order", href: "/track" },
      { label: "FAQs", href: "/faq" },
      { label: "Shipping & Delivery", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "About Onelink", href: "/about" },
      { label: "Coverage Map", href: "/coverage" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="section-dark">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-16 lg:py-20 grid gap-10 lg:gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
        {/* Brand */}
        <div className="flex flex-col gap-5">
          <Image
            src="/brand/lockup-white.png"
            alt="Onelink"
            width={160}
            height={62}
          />
          <p className="text-sm text-white/70 max-w-xs leading-relaxed">
            Premium products delivered across Kingston in 15–30 minutes.
            One Link. Endless Possibilities.
          </p>
          <div className="flex items-center gap-3 text-white/80">
            <Link
              href="https://instagram.com/onelink"
              aria-label="Instagram"
              className="hover:text-white transition-colors"
            >
              <InstagramLogo size={22} />
            </Link>
            <Link
              href="https://wa.me/18760000000"
              aria-label="WhatsApp"
              className="hover:text-[var(--color-whatsapp)] transition-colors"
            >
              <WhatsappLogo size={22} weight="fill" />
            </Link>
          </div>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-white/60">
              {col.title}
            </p>
            <ul className="flex flex-col gap-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-white/85 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© 2026 Onelink. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/legal/terms" className="hover:text-white/90">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-white/90">Privacy</Link>
            <Link href="/legal/age-policy" className="hover:text-white/90">18+ Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
