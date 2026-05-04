import { InfoPage, InfoSection } from "@/components/site/info-page";

export const metadata = { title: "Shipping & Delivery" };

const ZONES = [
  { name: "Liguanea", fee: 600 },
  { name: "New Kingston", fee: 600 },
  { name: "Half Way Tree", fee: 650 },
  { name: "Barbican", fee: 700 },
  { name: "Cherry Gardens", fee: 750 },
  { name: "Stony Hill", fee: 800 },
  { name: "Constant Spring", fee: 700 },
  { name: "Papine", fee: 700 },
  { name: "Harbour View", fee: 900 },
  { name: "Portmore", fee: 1100 },
];

export default function ShippingPage() {
  return (
    <InfoPage
      eyebrow="Customer Care"
      title="Shipping &amp; Delivery"
      intro="Onelink delivers across ten zones in Kingston and surrounding parishes. Most orders arrive in 15–45 minutes."
    >
      <InfoSection heading="Delivery zones &amp; fees">
        <p>
          Fees vary by zone and are added at checkout. All amounts are in Jamaican Dollars
          (JMD).
        </p>
        <ul className="mt-2 divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded-[var(--radius-card)] overflow-hidden">
          {ZONES.map((z) => (
            <li key={z.name} className="flex items-center justify-between px-4 py-3">
              <span>{z.name}</span>
              <span className="font-medium">JMD$ {z.fee.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </InfoSection>

      <InfoSection heading="Estimated delivery time">
        <p>
          15–45 minutes from order placed to delivery, depending on zone, time of day, traffic,
          and rider availability. Late-night and peak-hour orders may take longer. Estimates
          shown at checkout are best-effort, not guaranteed.
        </p>
      </InfoSection>

      <InfoSection heading="What to expect">
        <ul className="list-disc pl-5 space-y-1">
          <li>SMS confirmation when your order is placed.</li>
          <li>SMS when the rider is dispatched and on the way.</li>
          <li>Discreet, sealed packaging — no Onelink branding visible.</li>
          <li>SMS confirmation when the order is delivered.</li>
        </ul>
      </InfoSection>

      <InfoSection heading="ID at delivery">
        <p>
          For orders containing age-restricted items, the rider will ask for government-issued
          photo ID before handing over the order. The recipient must be 18+ and present at the
          delivery address. The rider does not photograph or retain ID.
        </p>
      </InfoSection>

      <InfoSection heading="Failed deliveries">
        <p>
          If we can&apos;t reach you on the phone you provided and no eligible adult is at the
          address, the rider will return the order. A re-delivery fee equal to the original
          delivery charge may apply. For Cash on Delivery orders, full payment must still be
          available on re-delivery.
        </p>
      </InfoSection>

      <InfoSection heading="Out of zone?">
        <p>
          We&apos;re expanding. If your address isn&apos;t in our list yet, message us on
          WhatsApp with your area and we&apos;ll let you know when we add it.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
