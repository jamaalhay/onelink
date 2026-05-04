export const metadata = { title: "Age Policy" };

export default function AgePolicyPage() {
  return (
    <>
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-2">Age Policy</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">Last updated: 1 May 2026</p>

      <Section heading="18+ only">
        <p>
          Onelink is for adults aged 18 or older. We sell products that are restricted under
          Jamaican law and our own policy, and our service is not available to minors. By
          using Onelink &mdash; whether browsing the site, placing an order, or accepting a
          delivery &mdash; you confirm that you are at least 18 years old.
        </p>
      </Section>

      <Section heading="What this covers">
        <p>The following categories sold on Onelink are restricted to adults 18+:</p>
        <ul>
          <li>Vaping devices and e-liquids</li>
          <li>Nicotine pouches (ZYN and similar)</li>
          <li>Lighters</li>
          <li>Rolling papers and other smoking accessories</li>
        </ul>
        <p>
          Other items we carry (drinks, snacks, packaged goods) are sold under the same 18+
          policy as a service-wide rule, even when those individual items are not legally
          age-restricted.
        </p>
      </Section>

      <Section heading="How we verify age">
        <ol>
          <li>
            <strong>Site entry:</strong> first-time visitors see an age confirmation prompt and
            must confirm they are 18+ to continue. The confirmation is stored in a cookie on
            your device.
          </li>
          <li>
            <strong>Checkout:</strong> by placing an order you reaffirm that you are 18 or older
            and that the order is not for anyone under 18.
          </li>
          <li>
            <strong>At delivery:</strong> the rider may request government-issued photo ID
            before handing over an order containing age-restricted items. The rider visually
            verifies the ID; we do not retain a copy of the document.
          </li>
        </ol>
      </Section>

      <Section heading="Refusal of service">
        <p>The rider will refuse delivery and the order may be cancelled if:</p>
        <ul>
          <li>The recipient appears to be under 18 and cannot provide valid ID.</li>
          <li>The recipient is visibly intoxicated.</li>
          <li>The recipient is not the person who placed the order and no adult 18+ is present.</li>
          <li>The rider has reasonable suspicion that the products are intended for a minor.</li>
        </ul>
        <p>
          A re-delivery fee may apply, or a refund may be issued at our discretion subject to
          our <a href="/legal/terms" className="underline">Terms of Service</a>.
        </p>
      </Section>

      <Section heading="No buying for minors">
        <p>
          It is a violation of these terms &mdash; and may be a violation of Jamaican law &mdash;
          to purchase age-restricted products on behalf of someone under 18. We may permanently
          ban accounts and addresses associated with confirmed violations.
        </p>
      </Section>

      <Section heading="Reporting">
        <p>
          If you believe a minor has used or attempted to use Onelink, or that someone is
          buying age-restricted products for a minor, please contact us via WhatsApp or email{" "}
          <a href="mailto:hello@onelink.example" className="underline">
            hello@onelink.example
          </a>
          . We take reports seriously and will investigate.
        </p>
      </Section>
    </>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold tracking-tight mb-3">{heading}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-[var(--color-text)]">
        {children}
      </div>
    </section>
  );
}
