import { InfoPage, InfoSection } from "@/components/site/info-page";

export const metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <InfoPage
      eyebrow="Customer Care"
      title="Returns"
      intro="Most of what we sell is age-restricted, perishable, or hygienically sensitive — so it can't be returned once delivered. But if something goes wrong with your order, we'll fix it."
    >
      <InfoSection heading="When you can return">
        <p>
          We accept returns or replacements within <strong>24 hours of delivery</strong> in any
          of these cases:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The product arrived damaged, leaking, or in unsealed packaging.</li>
          <li>You received the wrong item or quantity.</li>
          <li>The product is materially not as described on the listing.</li>
          <li>The product is past its &ldquo;use by&rdquo; date.</li>
        </ul>
      </InfoSection>

      <InfoSection heading="What we can't accept back">
        <ul className="list-disc pl-5 space-y-1">
          <li>Vapes, e-liquids, and nicotine pouches once the seal is broken.</li>
          <li>Food and drink that has been opened or partially consumed.</li>
          <li>Lighters that have been used.</li>
          <li>Items damaged after delivery (e.g. dropped, exposed to heat).</li>
          <li>Buyer&apos;s remorse — change of mind on a sealed, undamaged order.</li>
        </ul>
        <p>
          These exclusions exist for safety, hygiene, and Jamaican consumer-protection law
          around age-restricted goods.
        </p>
      </InfoSection>

      <InfoSection heading="How to file a claim">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Message us on WhatsApp or email within 24 hours of delivery.</li>
          <li>Include your order number (e.g. OL-123) and a photo of the issue.</li>
          <li>We&apos;ll review and respond within one business day.</li>
        </ol>
      </InfoSection>

      <InfoSection heading="Refunds">
        <p>
          Approved refunds for card payments are returned to the original card and may take 5–10
          business days to appear depending on your bank. Cash on Delivery refunds are made in
          JMD via a follow-up rider visit or store credit, whichever is more practical.
        </p>
      </InfoSection>

      <InfoSection heading="Cancellations">
        <p>
          You can cancel an order any time before the rider is dispatched. Once dispatched, the
          full delivery fee still applies even if you refuse the order at the door.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
