import { redirect } from "next/navigation";
import { CheckoutStepper } from "@/components/site/checkout-stepper";
import { OrderSummary } from "@/components/site/order-summary";
import { WhatsAppCta } from "@/components/site/whatsapp-cta";
import { getCart, listShippingOptions } from "@/lib/medusa/cart";
import { CheckoutForm } from "@/components/site/checkout-form";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCart();
  if (!cart || (cart.items?.length ?? 0) === 0) {
    redirect("/cart");
  }

  const shippingOptions = await listShippingOptions();
  const optionMap = shippingOptions.map((o) => ({
    id: o.id,
    name: o.name,
    amount: typeof o.amount === "number" ? o.amount : null,
    data: o.data ?? null,
  }));

  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-10 py-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-6">Checkout</h1>
          <CheckoutStepper current="Payment" />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 lg:px-10 py-10 grid lg:grid-cols-[1fr_24rem] gap-10">
        <CheckoutForm
          shippingOptions={optionMap}
          initialEmail={cart.email}
          initialShippingOptionId={cart.shipping_methods?.[0]?.shipping_option_id ?? null}
        />

        <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <OrderSummary
            data={{
              items: (cart.items ?? []).map((it) => ({
                id: it.id,
                title: it.product_title ?? "Item",
                variant_title: it.variant_title,
                thumbnail: it.thumbnail,
                unit_price: it.unit_price,
                quantity: it.quantity,
                total: it.total,
              })),
              subtotal: cart.subtotal,
              shipping_total: cart.shipping_total,
              total: cart.total,
              shipping_methods: cart.shipping_methods,
            }}
          />
          <WhatsAppCta variant="inline" message="Hi Onelink, I need help at checkout." />
        </div>
      </section>
    </>
  );
}
