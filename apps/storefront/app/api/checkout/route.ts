import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sdk } from "@/lib/medusa/client";

const CART_COOKIE = "onelink_cart_id";

interface PlacePayload {
  customer: { name: string; phone: string; email?: string };
  address: { street: string; landmark?: string };
  shipping_option_id: string;
  payment_method?: "card" | "cod";
}

async function getCartId(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(CART_COOKIE)?.value;
}

export async function POST(req: Request) {
  try {
    const cartId = await getCartId();
    if (!cartId) {
      return NextResponse.json({ error: "No cart" }, { status: 400 });
    }
    const body = (await req.json()) as PlacePayload;
    if (!body.customer.name || !body.customer.phone || !body.address.street) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!body.shipping_option_id) {
      return NextResponse.json({ error: "Missing shipping zone" }, { status: 400 });
    }

    // Validate payment_method up front — bad client input shouldn't reach Medusa.
    const ALLOWED_PAYMENT_METHODS = new Set(["card", "cod"]);
    const method = body.payment_method ?? "card";
    if (!ALLOWED_PAYMENT_METHODS.has(method)) {
      return NextResponse.json({ error: `Unknown payment_method "${method}"` }, { status: 400 });
    }
    // Card payments use Stripe when configured; otherwise fall back to the
    // system_default provider (no real charge — useful for staging).
    const cardProvider = process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true"
      ? "pp_stripe_stripe"
      : "pp_system_default";
    const providerId = method === "cod" ? "pp_cod_cod" : cardProvider;

    const [first, ...rest] = body.customer.name.trim().split(/\s+/);
    const email =
      body.customer.email?.trim() ||
      `${body.customer.phone.replace(/\D/g, "")}@onelink.local`;

    // Update cart with customer + address
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
    });

    // Pick the shipping option
    await sdk.store.cart.addShippingMethod(cartId, { option_id: body.shipping_option_id });

    const cartFresh = await sdk.store.cart.retrieve(cartId, {
      fields: "id,*payment_collection,payment_collection.payment_sessions.*",
    });
    if (!cartFresh.cart.payment_collection?.payment_sessions?.length) {
      try {
        await sdk.store.payment.initiatePaymentSession(cartFresh.cart, { provider_id: providerId });
      } catch (err) {
        console.error("[api/checkout] initPayment err:", err);
      }
    }

    // Complete the order
    const result = await sdk.store.cart.complete(cartId);
    if (result.type === "order") {
      const res = NextResponse.json({ ok: true, orderId: result.order.id });
      // Clear cart cookie now that order is placed
      res.cookies.set({
        name: CART_COOKIE,
        value: "",
        maxAge: 0,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return res;
    }
    return NextResponse.json({ ok: false, error: result.error?.message ?? "Checkout failed" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/checkout] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
