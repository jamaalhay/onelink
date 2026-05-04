import { InfoPage, InfoSection } from "@/components/site/info-page";

export const metadata = { title: "Press" };

export default function PressPage() {
  return (
    <InfoPage
      eyebrow="About"
      title="Press &amp; media"
      intro="If you're writing about delivery, on-demand commerce in the Caribbean, or what's coming next for Kingston's small-business retail — we'd love to talk."
    >
      <InfoSection heading="Quick facts">
        <ul className="list-disc pl-5 space-y-1">
          <li>Founded: 2026</li>
          <li>Based: Kingston, Jamaica</li>
          <li>Coverage: 10 active zones across Kingston and surrounding parishes</li>
          <li>Categories: vapes, ZYN, lighters, smoking accessories, drinks, snacks</li>
          <li>Payment: card (Stripe) + Cash on Delivery in JMD</li>
          <li>Average delivery: 15–45 minutes within zone</li>
        </ul>
      </InfoSection>

      <InfoSection heading="Brand assets">
        <p>
          For logo, wordmark, lockup, and product photography, contact{" "}
          <a href="mailto:press@onelinkjm.com" className="underline">
            press@onelinkjm.com
          </a>{" "}
          and we&apos;ll send a press kit.
        </p>
      </InfoSection>

      <InfoSection heading="Interviews">
        <p>
          Reach out to{" "}
          <a href="mailto:press@onelinkjm.com" className="underline">
            press@onelinkjm.com
          </a>{" "}
          to schedule. Please include outlet, deadline, and topic. We try to reply within one
          business day.
        </p>
      </InfoSection>

      <InfoSection heading="In the news">
        <p className="text-[var(--color-text-muted)]">
          Press mentions and features will be listed here. Drop us a note if you&apos;ve covered
          us and we&apos;ll add it.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
