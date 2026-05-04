export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">Last updated: 1 May 2026</p>

      <Section heading="1. Agreement to terms">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your use of Onelink&apos;s website,
          mobile experiences, and delivery service (collectively, &ldquo;Onelink&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;). By browsing the site, creating a cart, placing an
          order, or accepting a delivery from us, you agree to these Terms. If you do not agree,
          please do not use Onelink.
        </p>
      </Section>

      <Section heading="2. Eligibility">
        <p>
          You must be at least 18 years old to use Onelink. By using the service you represent
          that you are 18 or older and legally able to enter into a binding contract. We reserve
          the right to verify your age at any point in the order or delivery process and to
          refuse or cancel service if we cannot reasonably confirm it. See our{" "}
          <Link href="/legal/age-policy">Age Policy</Link> for details on age-restricted products.
        </p>
        <p>
          Onelink currently delivers within select areas of Kingston and surrounding parishes in
          Jamaica. The available delivery zones are listed at checkout.
        </p>
      </Section>

      <Section heading="3. Your account and information">
        <p>
          You are responsible for the accuracy of any information you provide at checkout —
          including your name, phone number, email, and delivery address — and for keeping your
          account access (if applicable) secure. We may contact you about your order via SMS,
          email, or WhatsApp using the contact details you provided.
        </p>
      </Section>

      <Section heading="4. Orders, pricing, and payment">
        <ul>
          <li>
            All prices are listed in Jamaican Dollars (JMD) and include any applicable taxes
            unless otherwise noted at checkout.
          </li>
          <li>
            Placing an order constitutes an offer to purchase. We confirm acceptance once we
            dispatch the order. We may decline or cancel an order before dispatch for any
            reason, including stock availability, suspected fraud, age verification failure, or
            outside-of-zone delivery.
          </li>
          <li>
            Card payments are processed via Stripe. Cash on Delivery (COD) requires the rider
            to collect the full amount in JMD on arrival. Riders may decline delivery if the
            recipient cannot pay.
          </li>
          <li>
            Pricing, availability, and product descriptions are subject to change without notice.
            We work to keep the catalog accurate but do not warrant that all descriptions are
            complete or error-free.
          </li>
        </ul>
      </Section>

      <Section heading="5. Delivery">
        <p>
          Delivery times shown at checkout (typically 15&ndash;45 minutes within zone) are
          estimates and depend on traffic, weather, rider availability, and other factors outside
          our control. We are not liable for reasonable delays.
        </p>
        <p>
          You or an authorised adult (18+) must be present at the delivery address to receive the
          order. The rider may request photo ID before handing over age-restricted items. If no
          eligible adult is present, the rider may return the order at our discretion and a
          re-delivery fee may apply.
        </p>
      </Section>

      <Section heading="6. Returns and refunds">
        <p>
          Many of the products we sell are perishable, age-restricted, or hygienically sensitive
          and are therefore non-returnable once delivered, except where required by Jamaican
          consumer protection law. If your order arrives damaged, incorrect, or materially not
          as described, contact us within 24 hours via WhatsApp or the contact form and we will
          investigate and offer a replacement, partial refund, or full refund as appropriate.
        </p>
        <p>
          Refunds for card payments are returned to the original payment method and may take up
          to 10 business days to appear depending on your bank. Cash refunds are made in JMD
          where reasonably practicable.
        </p>
      </Section>

      <Section heading="7. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>Use Onelink to purchase age-restricted products on behalf of anyone under 18.</li>
          <li>Misrepresent your identity, age, or contact details.</li>
          <li>Resell products purchased from Onelink without our written consent.</li>
          <li>
            Interfere with or attempt to compromise the site, our infrastructure, payment
            systems, or other users&apos; experience.
          </li>
          <li>Use the service for any unlawful purpose.</li>
        </ul>
      </Section>

      <Section heading="8. Age-restricted products">
        <p>
          Onelink sells products that are restricted under Jamaican law and Onelink policy,
          including (without limitation) vaping devices and e-liquids, nicotine pouches,
          lighters, and rolling papers. By placing an order containing any of these items you
          confirm that you are at least 18 years old and that you are not purchasing on behalf
          of a minor. Riders may refuse delivery if age cannot be reasonably verified.
        </p>
      </Section>

      <Section heading="9. Intellectual property">
        <p>
          The Onelink name, logo, brand, copy, and site content are owned by us or our licensors
          and are protected by Jamaican and international intellectual property laws. You may
          not copy, modify, distribute, or create derivative works from any of it without
          written permission.
        </p>
      </Section>

      <Section heading="10. Disclaimers">
        <p>
          Onelink is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. To
          the maximum extent permitted by Jamaican law, we disclaim all warranties, express or
          implied, including warranties of merchantability, fitness for a particular purpose,
          and non-infringement.
        </p>
      </Section>

      <Section heading="11. Limitation of liability">
        <p>
          To the fullest extent permitted by law, Onelink&apos;s aggregate liability arising out
          of or relating to these Terms or your use of the service is limited to the amount you
          paid for the specific order giving rise to the claim. We are not liable for indirect,
          incidental, consequential, or punitive damages.
        </p>
      </Section>

      <Section heading="12. Governing law">
        <p>
          These Terms are governed by the laws of Jamaica without regard to conflict of law
          principles. You agree to submit to the exclusive jurisdiction of the courts of
          Jamaica for any dispute arising out of or related to these Terms.
        </p>
      </Section>

      <Section heading="13. Changes">
        <p>
          We may update these Terms from time to time. The effective date is shown at the top of
          this page. Continued use of Onelink after changes are posted constitutes acceptance of
          the revised Terms.
        </p>
      </Section>

      <Section heading="14. Contact">
        <p>
          Questions about these Terms? Reach us via the WhatsApp link in the site footer or
          email{" "}
          <a href="mailto:hello@onelink.example" className="underline">
            hello@onelink.example
          </a>
          .
        </p>
      </Section>
    </>
  );
}

import Link from "next/link";

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
