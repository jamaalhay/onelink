import { InfoPage, InfoSection } from "@/components/site/info-page";

export const metadata = { title: "Careers" };

export default function CareersPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Work with us"
      intro="Onelink is small and growing fast. We're looking for sharp, dependable people who care about service and ship things on time."
    >
      <InfoSection heading="Riders">
        <p>
          We hire reliable riders with their own bike or scooter, a smartphone, and a clean
          record. Flexible shifts, transparent payout per delivery, weekly settlement.
          Requirements:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>18+ with valid ID and current driver&apos;s licence</li>
          <li>Smartphone with reliable mobile data</li>
          <li>Familiarity with at least one of our active zones</li>
          <li>Professional, courteous demeanour at the door</li>
        </ul>
        <p>
          Email your name, area, and a bit about your experience to{" "}
          <a href="mailto:riders@onelinkjm.com" className="underline">
            riders@onelinkjm.com
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection heading="Operations &amp; ops support">
        <p>
          We hire ops support for evenings and weekends — handling orders in the admin,
          coordinating riders, and replying to customer chats. Hourly, remote-friendly within
          Kingston.
        </p>
        <p>
          Email{" "}
          <a href="mailto:hello@onelinkjm.com" className="underline">
            hello@onelinkjm.com
          </a>{" "}
          with &ldquo;Ops Support&rdquo; in the subject line.
        </p>
      </InfoSection>

      <InfoSection heading="Engineering &amp; product">
        <p>
          We&apos;re not actively hiring engineers right now, but we&apos;re always interested
          in talking to people building cool things in Jamaica. Send a note any time.
        </p>
      </InfoSection>

      <InfoSection heading="What we offer">
        <ul className="list-disc pl-5 space-y-1">
          <li>Transparent comp and weekly payouts.</li>
          <li>A small, focused team — your work will visibly move the business.</li>
          <li>Real autonomy, not pretend autonomy.</li>
          <li>
            A product people actually use and recommend &mdash; the kind of thing where you
            tell people what you do and they say &ldquo;oh, I order from you.&rdquo;
          </li>
        </ul>
      </InfoSection>
    </InfoPage>
  );
}
