"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe, STRIPE_ENABLED } from "@/lib/stripe";
import {
  trackBeginCheckout,
  trackPaymentMethodSelected,
  trackPurchase,
} from "@/lib/analytics";
import { formatJmd } from "@/lib/format";

const stripePromise = STRIPE_ENABLED ? getStripe() : null;

export interface CheckoutShippingOption {
  id: string;
  name: string;
  amount?: number | null;
  data?: Record<string, unknown> | null;
}

export interface CheckoutFormCartItem {
  id: string;
  product_title?: string | null;
  unit_price?: number | null;
  quantity?: number | null;
}

interface CheckoutFormProps {
  shippingOptions: CheckoutShippingOption[];
  initialEmail?: string | null;
  initialShippingOptionId?: string | null;
  cartTotal: number;
  cartCurrency: string;
  cartItems?: CheckoutFormCartItem[];
}

// Wraps the inner form in <Elements> when Stripe is enabled so the
// useStripe/useElements hooks work everywhere they're called. When Stripe is
// disabled the inner form runs alone — card payments fall back to the no-op
// system_default provider in /api/checkout, which doesn't need card details.
export function CheckoutForm(props: CheckoutFormProps) {
  // Stripe expects amount in the smallest currency unit. Medusa cart totals
  // are whole display units, so JMD 850 becomes 85000 minor units.
  // Keep this card-only for now: recent live failures are issuer declines
  // routed through Link, while plain card has succeeded on this account.
  const options = useMemo<StripeElementsOptions>(
    () => ({
      mode: "payment",
      amount: Math.max((props.cartTotal || 0) * 100, 100),
      currency: (props.cartCurrency || "jmd").toLowerCase(),
      paymentMethodTypes: ["card"],
      appearance: { theme: "stripe" },
    }),
    [props.cartTotal, props.cartCurrency]
  );

  return (
    <Elements stripe={stripePromise} options={STRIPE_ENABLED ? options : undefined}>
      <CheckoutFormInner {...props} />
    </Elements>
  );
}

function CheckoutFormInner({
  shippingOptions,
  initialEmail,
  initialShippingOptionId,
  cartTotal,
  cartCurrency,
  cartItems,
}: CheckoutFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [shippingPending, startShippingTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();

  // Fire begin_checkout exactly once per checkout-page mount. React strict
  // mode double-invokes effects in dev, so guard with a ref.
  const beganRef = useRef(false);
  useEffect(() => {
    if (beganRef.current) return;
    beganRef.current = true;
    trackBeginCheckout({
      total: cartTotal,
      currency: cartCurrency,
      items: cartItems?.map((it) => ({
        id: it.id,
        product_title: it.product_title ?? undefined,
        quantity: it.quantity ?? undefined,
        unit_price: it.unit_price ?? undefined,
      })) ?? null,
    });
  }, [cartTotal, cartCurrency, cartItems]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");

  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instructions, setInstructions] = useState("");

  const [shippingOptionId, setShippingOptionId] = useState<string>(
    initialShippingOptionId ?? ""
  );

  const [paymentMethod, setPaymentMethod] = useState<"card" | "cod">(STRIPE_ENABLED ? "card" : "cod");
  const [notifyViaWhatsApp, setNotifyViaWhatsApp] = useState(false);

  const selectPaymentMethod = (m: "card" | "cod") => {
    if (m === paymentMethod) return;
    setPaymentMethod(m);
    trackPaymentMethodSelected(m);
  };

  const selectedShippingOption = shippingOptions.find((o) => o.id === shippingOptionId);

  const handleShippingChange = (id: string) => {
    setShippingOptionId(id);
    setError(null);
    if (!id) return;

    startShippingTransition(async () => {
      try {
        const res = await fetch("/api/cart/shipping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipping_option_id: id }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) {
          setError(data.error ?? `Could not update delivery zone (${res.status})`);
          return;
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update delivery zone");
      }
    });
  };

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
    if (paymentMethod === "card" && !STRIPE_ENABLED) {
      setError("Card payment is not available in this environment. Choose Cash on Delivery.");
      return;
    }

    const customer = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
    };
    const address = {
      street: street.trim(),
      landmark: landmark.trim() || undefined,
      instructions: instructions.trim() || undefined,
    };

    startTransition(async () => {
      try {
        if (paymentMethod === "card" && STRIPE_ENABLED) {
          if (!stripe || !elements) {
            setError("Payment form is still loading — try again in a moment.");
            return;
          }

          // Submit Elements to validate before we ask the backend to mint a
          // PaymentIntent. Stripe requires this call before confirmPayment.
          const submitRes = await elements.submit();
          if (submitRes.error) {
            setError(submitRes.error.message ?? "Card details invalid");
            return;
          }

          // Server: write address+shipping, init Stripe session, return
          // client_secret.
          const initRes = await fetch("/api/payment/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customer,
              address,
              shipping_option_id: shippingOptionId,
              notify_via_whatsapp: notifyViaWhatsApp,
            }),
          });
          const initData = await initRes.json().catch(() => ({}));
          if (!initRes.ok || !initData.clientSecret) {
            setError(initData.error ?? `Payment init failed (${initRes.status})`);
            return;
          }

          // Confirm the PaymentIntent with the card details Elements has.
          const confirm = await stripe.confirmPayment({
            elements,
            clientSecret: initData.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/checkout/processing`,
            },
            redirect: "if_required",
          });
          if (confirm.error) {
            setError(confirm.error.message ?? "Card declined");
            return;
          }

          // Card succeeded → complete the cart on Medusa side.
          const completeRes = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customer,
              address,
              shipping_option_id: shippingOptionId,
              payment_method: "card",
              notify_via_whatsapp: notifyViaWhatsApp,
            }),
          });
          const completeData = await completeRes.json().catch(() => ({}));
          if (completeRes.ok && completeData.ok && completeData.orderId) {
            trackPurchase({
              orderId: completeData.orderId,
              total: cartTotal,
              currency: cartCurrency,
              paymentMethod: "card",
            });
            router.push(`/order/${completeData.orderId}/success`);
            router.refresh();
          } else {
            setError(
              completeData.error ?? `Could not complete order (${completeRes.status})`
            );
          }
          return;
        }

        // COD path (or Stripe disabled): one-shot.
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer,
            address,
            shipping_option_id: shippingOptionId,
            payment_method: paymentMethod,
            notify_via_whatsapp: notifyViaWhatsApp,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok && data.orderId) {
          trackPurchase({
            orderId: data.orderId,
            total: cartTotal,
            currency: cartCurrency,
            paymentMethod,
          });
          router.push(`/order/${data.orderId}/success`);
          router.refresh();
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
            onChange={(e) => handleShippingChange(e.target.value)}
            className="w-full h-11 px-3 rounded-[var(--radius-button)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
          >
            {shippingOptions.length === 0 ? (
              <option value="">No zones available</option>
            ) : (
              <>
                <option value="">Choose delivery zone</option>
                {shippingOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </>
            )}
          </select>
          {shippingOptionId && selectedShippingOption && (
            <span className="text-xs text-[var(--color-text-muted)] mt-1.5 block">
              {shippingPending
                ? "Updating order summary…"
                : `Delivery fee ${formatJmd(selectedShippingOption.amount ?? 0)}.`}
            </span>
          )}
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
          detail={STRIPE_ENABLED ? "Visa, Mastercard, AmEx" : "Unavailable in this environment"}
          checked={paymentMethod === "card"}
          onChange={() => selectPaymentMethod("card")}
          disabled={!STRIPE_ENABLED}
        />
        <PaymentRadio
          id="cod"
          label="Cash on Delivery"
          detail="Pay the rider on arrival"
          checked={paymentMethod === "cod"}
          onChange={() => selectPaymentMethod("cod")}
        />

        {paymentMethod === "card" && STRIPE_ENABLED && (
          <div className="mt-2 p-4 rounded-[var(--radius-button)] border border-[var(--color-border)] bg-white">
            <PaymentElement options={{ layout: "tabs", wallets: { link: "never" } }} />
          </div>
        )}
      </FormBlock>

      <FormBlock title="Order Updates">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={notifyViaWhatsApp}
            onChange={(e) => setNotifyViaWhatsApp(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-[var(--color-border-strong)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-2"
          />
          <span>
            <span className="text-sm font-medium text-[var(--color-text)] block">
              Send updates via WhatsApp
            </span>
            <span className="text-xs text-[var(--color-text-muted)] mt-0.5 block">
              Order confirmation and delivery progress straight to your WhatsApp.
              We&apos;ll fall back to SMS if your number isn&apos;t on WhatsApp.
            </span>
          </span>
        </label>
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
          className="inline-flex items-center justify-center h-12 px-6 rounded-[var(--radius-button)] bg-[var(--color-accent-bg)] hover:bg-[var(--color-accent-bg-hover)] text-white font-medium transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
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
  disabled = false,
}: {
  id: string;
  label: string;
  detail: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 p-4 rounded-[var(--radius-button)] border cursor-pointer transition-colors ${
        disabled
          ? "border-[var(--color-border)] bg-[var(--color-surface)] opacity-60 cursor-not-allowed"
          : checked
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
        disabled={disabled}
        className="mt-1 w-4 h-4 border-[var(--color-border-strong)] text-[var(--color-accent)] focus:ring-[var(--color-accent)] focus:ring-offset-2"
      />
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{detail}</p>
      </div>
    </label>
  );
}
