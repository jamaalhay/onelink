import { InfoPage, InfoSection } from "@/components/site/info-page";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Customer Care"
      title="Contact"
      intro="The fastest way to reach us is WhatsApp — we usually reply within minutes during operating hours."
    >
      <InfoSection heading="WhatsApp">
        <p>
          Tap the button below to start a chat. Include your order number if it&apos;s about a
          specific order.
        </p>
        <div className="mt-3">
          <WhatsAppCta variant="inline" message="Hi Onelink, I have a question." />
        </div>
      </InfoSection>

      <InfoSection heading="Email">
        <ul>
          <li>
            <strong>General:</strong>{" "}
            <a href="mailto:hello@onelinkjm.com" className="underline">
              hello@onelinkjm.com
            </a>
          </li>
          <li>
            <strong>Privacy / data requests:</strong>{" "}
            <a href="mailto:privacy@onelinkjm.com" className="underline">
              privacy@onelinkjm.com
            </a>
          </li>
          <li>
            <strong>Press:</strong>{" "}
            <a href="mailto:press@onelinkjm.com" className="underline">
              press@onelinkjm.com
            </a>
          </li>
        </ul>
      </InfoSection>

      <InfoSection heading="Hours">
        <p>
          Order desk is open daily, including weekends. Hours vary by zone — actual cut-off
          times appear at checkout. For questions about an in-flight order, riders are reachable
          via the call button on your tracking page.
        </p>
      </InfoSection>

      <InfoSection heading="Postal address">
        <p>
          Onelink Delivery
          <br />
          Kingston, Jamaica
        </p>
        <p className="text-[var(--color-text-muted)] text-sm">
          We don&apos;t accept returns or walk-ins at this address — please file claims via
          WhatsApp first.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
