export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">Last updated: 1 May 2026</p>

      <Section heading="Overview">
        <p>
          This Privacy Policy explains what personal information Onelink collects when you use
          our website and delivery service, why we collect it, how we use and share it, and what
          rights you have over it. We follow Jamaica&apos;s Data Protection Act, 2020 and apply
          common-sense data minimisation across the board.
        </p>
      </Section>

      <Section heading="Information we collect">
        <ul>
          <li>
            <strong>Order information:</strong> name, phone number, email address (optional),
            delivery address, delivery instructions, and items purchased.
          </li>
          <li>
            <strong>Payment information:</strong> we do <em>not</em> store full card numbers.
            Card data is collected and processed directly by our payment processor (Stripe).
            We retain the last 4 digits, card brand, and a Stripe-issued payment reference for
            reconciliation. For Cash on Delivery, no card data is collected at all.
          </li>
          <li>
            <strong>Device and usage information:</strong> IP address, browser type, pages
            viewed, and other standard server-log data, used to operate the site, prevent
            fraud, and improve performance.
          </li>
          <li>
            <strong>Cookies:</strong> we use a small number of essential cookies (cart session,
            age-gate confirmation) and may use anonymous analytics cookies. We do not currently
            run third-party advertising trackers.
          </li>
          <li>
            <strong>Age verification:</strong> if a rider requests photo ID at delivery, we do
            not retain a copy of the document &mdash; the rider visually confirms age and either
            completes or refuses the delivery.
          </li>
        </ul>
      </Section>

      <Section heading="How we use it">
        <ul>
          <li>To process, fulfil, and deliver your order.</li>
          <li>
            To send order confirmations, shipping updates, and delivery notifications via SMS,
            email, or WhatsApp using the contact details you provided.
          </li>
          <li>To process payments and refunds, and to detect and prevent fraud.</li>
          <li>To respond to support requests and feedback.</li>
          <li>To meet legal, regulatory, and accounting obligations under Jamaican law.</li>
        </ul>
      </Section>

      <Section heading="Who we share it with">
        <p>We share information only with parties who help us deliver the service:</p>
        <ul>
          <li>
            <strong>Payment processing:</strong> Stripe (card payments). Stripe handles card
            data under PCI&nbsp;DSS and its own privacy policy.
          </li>
          <li>
            <strong>Notifications:</strong> Twilio (SMS) and Resend (email) deliver our order
            messages. They receive your phone number or email plus the message body.
          </li>
          <li>
            <strong>Delivery riders:</strong> we share your name, phone, address, and items so
            the rider can complete the delivery. Riders are bound by confidentiality
            obligations.
          </li>
          <li>
            <strong>Infrastructure providers:</strong> our hosting (Vercel, Railway) and
            database (Supabase) process data on our behalf under their respective security
            programs.
          </li>
          <li>
            <strong>Law enforcement:</strong> when required by valid legal process or to
            protect the safety of users, riders, or our staff.
          </li>
        </ul>
        <p>We do not sell your personal information.</p>
      </Section>

      <Section heading="Data retention">
        <p>
          We retain order and payment records for the period required by Jamaican tax and
          consumer-protection law (typically 7 years). Marketing-eligible contact information
          is retained until you ask us to delete it. Server logs are retained on a rolling
          90-day window.
        </p>
      </Section>

      <Section heading="Your rights">
        <p>
          Under Jamaica&apos;s Data Protection Act you may request access to the personal data
          we hold about you, ask us to correct inaccuracies, request deletion (subject to legal
          retention obligations), or object to certain types of processing. Contact us at{" "}
          <a href="mailto:privacy@onelink.example" className="underline">
            privacy@onelink.example
          </a>{" "}
          and we will respond within 30 days.
        </p>
      </Section>

      <Section heading="Security">
        <p>
          We use industry-standard encryption for data in transit (HTTPS/TLS) and at rest
          (managed Postgres). Access to customer data inside the company is restricted to
          staff who need it to operate the service. No system is perfectly secure, and we
          encourage you to use a strong, unique password (when account features apply) and to
          notify us promptly of any suspected unauthorised use.
        </p>
      </Section>

      <Section heading="Children">
        <p>
          Onelink is not intended for anyone under 18. We do not knowingly collect personal
          information from minors. If you believe a minor has shared information with us, contact
          us and we will delete it.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          We may update this Privacy Policy from time to time. The effective date is shown at
          the top. Material changes will be communicated through the site or via email where we
          have one on file.
        </p>
      </Section>

      <Section heading="Contact">
        <p>
          Questions or requests about your data? Email{" "}
          <a href="mailto:privacy@onelink.example" className="underline">
            privacy@onelink.example
          </a>
          .
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
