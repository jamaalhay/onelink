import { InfoPage, InfoSection } from "@/components/site/info-page";

export const metadata = { title: "About Onelink" };

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="One link. Endless possibilities."
      intro="Onelink is a premium on-demand delivery service for Kingston. We bring vapes, ZYN, lighters, drinks, snacks, and the small everyday essentials to your door in 15–45 minutes — sourced direct, packaged discreetly, and tracked end-to-end."
    >
      <InfoSection heading="What we believe">
        <p>
          Late-night runs to the gas station shouldn&apos;t exist anymore. Onelink lives at the
          intersection of speed, taste, and trust: a curated catalog of products people
          actually want, delivered fast, in packaging that respects your privacy. Every choice —
          from how riders are dispatched to how a confirmation SMS is worded — is a chance to
          make the experience feel a little more premium than the average delivery app.
        </p>
      </InfoSection>

      <InfoSection heading="How it works">
        <ol className="list-decimal pl-5 space-y-1">
          <li>You place an order from any device — no app install required.</li>
          <li>
            We confirm and dispatch a rider in your zone. You get an SMS with a tracking link.
          </li>
          <li>The rider arrives discreetly. ID check at the door for age-restricted items.</li>
          <li>Pay by card up front, or cash on delivery in JMD.</li>
        </ol>
      </InfoSection>

      <InfoSection heading="Where we operate">
        <p>
          Currently active in ten zones across Kingston and surrounding parishes — see the{" "}
          <a href="/coverage" className="underline">Coverage map</a>. We&apos;re expanding;
          if your area isn&apos;t listed, message us and we&apos;ll let you know when we add it.
        </p>
      </InfoSection>

      <InfoSection heading="Standards">
        <ul className="list-disc pl-5 space-y-1">
          <li>100% authentic products, sourced direct from authorised distributors.</li>
          <li>Strict 18+ enforcement on age-restricted categories.</li>
          <li>
            Discreet packaging — plain, sealed, no Onelink branding visible from the outside.
          </li>
          <li>End-to-end PCI-compliant card processing via Stripe.</li>
        </ul>
      </InfoSection>

      <InfoSection heading="Get in touch">
        <p>
          For partnerships, press, or just to say hi:{" "}
          <a href="mailto:hello@onelinkjm.com" className="underline">
            hello@onelinkjm.com
          </a>
          . Customers — message us on WhatsApp from any page.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
