import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sdk } from "@/lib/medusa/client";

const CART_COOKIE = "onelink_cart_id";

interface InitPayload {
  customer: { name: string; phone: string; email?: string };
  address: { street: string; landmark?: string; instructions?: string };
  shipping_option_id: string;
  notify_via_whatsapp?: boolean;
}

async function getCartId(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(CART_COOKIE)?.value;
}

// Prepares the cart for Stripe confirm: writes shipping address, picks the
// shipping option, and initiates a Stripe payment session. Returns the
// PaymentIntent client_secret so the client can mount stripe.confirmPayment().
export async function POST(req: Request) {
  try {
    const cartId = await getCartId();
    if (!cartId) return NextResponse.json({ error: "No cart" }, { status: 400 });

    const body = (await req.json()) as InitPayload;
    if (!body.customer?.name || !body.customer?.phone || !body.address?.street) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!body.shipping_option_id) {
      return NextResponse.json({ error: "Missing shipping zone" }, { status: 400 });
    }

    const [first, ...rest] = body.customer.name.trim().split(/\s+/);
    const email =
      body.customer.email?.trim() ||
      `${body.customer.phone.replace(/\D/g, "")}@onelink.local`;

    await sdk.store.cart.update(cartId, {
      email,
      shipping_address: {
        first_name: first,
        last_name: rest.join(" "),
        phone: body.customer.phone,
        address_1: body.address.street + (body.address.landmark ? ` (${body.address.landmark})` : ""),
        address_2: "",
        city: "Kingston",
        country_code: "jm",
        province: "Kingston",
        postal_code: "00000",
      },
      billing_address: {
        first_name: first,
        last_name: rest.join(" "),
        phone: body.customer.phone,
        address_1: body.address.street + (body.address.landmark ? ` (${body.address.landmark})` : ""),
        address_2: "",
        city: "Kingston",
        country_code: "jm",
        province: "Kingston",
        postal_code: "00000",
      },
      metadata: {
        notify_via_whatsapp: body.notify_via_whatsapp === true,
        delivery_instructions: body.address.instructions?.trim() || undefined,
      },
    });

    await sdk.store.cart.addShippingMethod(cartId, { option_id: body.shipping_option_id });

    const cartFresh = await sdk.store.cart.retrieve(cartId, {
      fields: "id,total,currency_code,*payment_collection,payment_collection.payment_sessions.*",
    });

    const result = await sdk.store.payment.initiatePaymentSession(cartFresh.cart, {
      provider_id: "pp_stripe_stripe",
    });

    const session = result.payment_collection?.payment_sessions?.find(
      (s) => s.provider_id === "pp_stripe_stripe"
    );
    const clientSecret = (session?.data as { client_secret?: string } | undefined)?.client_secret;

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Stripe session created but no client_secret returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      clientSecret,
      amount: cartFresh.cart.total,
      currency: cartFresh.cart.currency_code,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/payment/init] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
