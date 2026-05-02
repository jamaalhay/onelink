"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface CheckoutShippingOption {
  id: string;
  name: string;
  amount?: number | null;
  data?: Record<string, unknown> | null;
}

interface CheckoutFormProps {
  shippingOptions: CheckoutShippingOption[];
  initialEmail?: string | null;
  initialShippingOptionId?: string | null;
}

export function CheckoutForm({ shippingOptions, initialEmail, initialShippingOptionId }: CheckoutFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Customer info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");

  // Address
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instructions, setInstructions] = useState("");

  // Shipping (zone) selection
  const [shippingOptionId, setShippingOptionId] = useState<string>(
    initialShippingOptionId ?? shippingOptions[0]?.id ?? ""
  );

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">("card");

  const handlePlace = () => {
    setError(null);
    if (!name.trim() || !phone.trim() || !street.trim()) {
      setError("Please fill in your name, phone, and address.");
      return;
    }
    if (!shippingOptionId) {
      setError("Please select a delivery zone.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined },
            address: { street: street.trim(), landmark: landmark.trim() || undefined },
            shipping_option_id: shippingOptionId,
            payment_method: paymentMethod,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok && data.orderId) {
          router.push(`/order/${data.orderId}/success`);
        } else {
          setError(data.error ?? `Could not place order (${res.status})`);
        }
      } catch (err) {
        console.error("[checkout]", err);
        setError(err instanceof Error ? err.message : "Checkout failed");
      }
    });
  };

  return (
    <div className="space-y-8">
      <FormBlock title="Customer Information">
        <Field label="Full name" placeholder="Your name" value={name} onChange={setName} />
        <Field label="Phone (WhatsApp)" placeholder="+1 876 …" type="tel" value={phone} onChange={setPhone} />
        <Field label="Email (optional)" placeholder="you@email.com" type="email" value={email} onChange={setEmail} />
      </FormBlock>

      <FormBlock title="Delivery Address">
        <Field label="Street address" placeholder="Address line 1" value={street} onChange={setStreet} />
        <Field
          label="Landmark or unit (optional)"
          placeholder="Apt 4B / next to …"
          value={landmark}
          onChange={setLandmark}
        />
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">Delivery zone</span>
          <select
            value={shippingOptionId}
            onChange={(e) => setShippingOptionId(e.target.value)}
            className="w-full h-11 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
          >
            {shippingOptions.length === 0 ? (
              <option value="">No zones available</option>
            ) : (
              shippingOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))
            )}
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">
            Delivery instructions (optional)
          </span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Gate code, building, special instructions"
            rows={3}
            className="w-full px-3 py-2 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2 resize-none"
          />
        </label>
      </FormBlock>

      <FormBlock title="Payment Method">
        <PaymentRadio
          id="card"
          label="Card payment"
          detail="Visa, Mastercard, AmEx (test mode)"
          checked={paymentMethod === "card"}
          onChange={() => setPaymentMethod("card")}
        />
        <PaymentRadio
          id="cod"
          label="Cash on Delivery"
          detail="Pay the rider on arrival"
          checked={paymentMethod === "cod"}
          onChange={() => setPaymentMethod("cod")}
        />
      </FormBlock>

      {error && (
        <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/30 rounded-[var(--radius-button)] p-3">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <Link
          href="/cart"
          className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--radius-button)] border border-[var(--color-border)] hover:bg-[var(--color-surface)] font-medium"
        >
          ← Back to cart
        </Link>
        <button
          type="button"
          onClick={handlePlace}
          disabled={pending}
          className="inline-flex items-center justify-center h-12 px-6 rounded-[var(--radius-button)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Placing order…" : "Place order"}
        </button>
      </div>
      <p className="text-xs text-[var(--color-text-muted)] -mt-2">
        By placing this order you agree to our Terms and acknowledge our Privacy Policy.
      </p>
    </div>
  );
}

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-6">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-4">
        {title}
      </p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[var(--color-text)] mb-1.5 block">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
      />
    </label>
  );
}

function PaymentRadio({
  id,
  label,
  detail,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  detail: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 p-4 rounded-[var(--radius-button)] border cursor-pointer transition-colors ${
        checked
          ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
          : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
      }`}
    >
      <input
        type="radio"
        name="payment"
        id={id}
        checked={checked}
        onChange={onChange}
        className="mt-1 w-4 h-4 border-[var(--color-border-strong)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-2"
      />
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{detail}</p>
      </div>
    </label>
  );
}
