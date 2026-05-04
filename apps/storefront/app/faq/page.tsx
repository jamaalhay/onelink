import { InfoPage, InfoSection } from "@/components/site/info-page";

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <InfoPage
      eyebrow="Customer Care"
      title="Frequently asked questions"
      intro="Quick answers to the things customers ask most. Anything else, message us on WhatsApp — we usually reply within minutes."
    >
      <InfoSection heading="How fast is delivery?">
        <p>
          Most orders inside our active zones (New Kingston, Liguanea, Barbican, Half Way Tree,
          Cherry Gardens, Stony Hill, Constant Spring, Papine, Harbour View, Portmore) arrive in
          15–45 minutes. You&apos;ll get an SMS when the rider is on the way and another when
          they&apos;re at your door.
        </p>
      </InfoSection>

      <InfoSection heading="What payment methods do you accept?">
        <p>
          Card payments (Visa, Mastercard, AmEx) at checkout, and Cash on Delivery (JMD only).
          For COD, the rider will collect the exact total when they hand over the order. We
          don&apos;t accept partial payments at the door.
        </p>
      </InfoSection>

      <InfoSection heading="Do you check ID?">
        <p>
          Yes — for any order containing age-restricted products (vapes, ZYN, lighters, rolling
          papers), the rider will ask for government-issued photo ID before handing over the
          order. The recipient must be 18+. See our{" "}
          <a href="/legal/age-policy" className="underline">Age Policy</a>.
        </p>
      </InfoSection>

      <InfoSection heading="Can I track my order?">
        <p>
          Yes. After checkout you get a tracking link via SMS and email. You can also visit{" "}
          <a href="/track" className="underline">/track</a> any time and paste your order ID.
        </p>
      </InfoSection>

      <InfoSection heading="Can I return or refund an order?">
        <p>
          Most of what we sell is age-restricted, perishable, or hygienically sensitive and
          can&apos;t be returned once delivered. If your order arrives damaged, incorrect, or
          materially not as described, contact us within 24 hours and we&apos;ll make it right
          (replacement, partial refund, or full refund as applicable). Full policy on the{" "}
          <a href="/returns" className="underline">Returns</a> page.
        </p>
      </InfoSection>

      <InfoSection heading="Where do you deliver?">
        <p>
          We currently cover ten zones across Kingston and surrounding areas. Available zones
          appear in the dropdown at checkout — if your address isn&apos;t there yet, drop us a
          line and we&apos;ll let you know when we expand. See the{" "}
          <a href="/coverage" className="underline">Coverage map</a>.
        </p>
      </InfoSection>

      <InfoSection heading="What if no one is home?">
        <p>
          The rider will call and text the number you gave at checkout. If we can&apos;t reach
          you within ~10 minutes, the order is brought back and a re-delivery fee may apply.
          For age-restricted items, the rider can&apos;t hand them off to a minor or leave them
          unattended.
        </p>
      </InfoSection>

      <InfoSection heading="How do I become a rider?">
        <p>
          We&apos;re always looking for reliable riders. Hit the{" "}
          <a href="/careers" className="underline">Careers</a> page or email us.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
