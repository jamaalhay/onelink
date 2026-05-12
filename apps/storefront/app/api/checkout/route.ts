import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sdk } from "@/lib/medusa/client";

const CART_COOKIE = "onelink_cart_id";

interface PlacePayload {
  customer: { name: string; phone: string; email?: string };
  address: { street: string; landmark?: string; instructions?: string };
  shipping_option_id: string;
  payment_method?: "card" | "cod";
  notify_via_whatsapp?: boolean;
}

async function getCartId(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(CART_COOKIE)?.value;
}

// Two flows land here:
//   COD → write address+shipping, init pp_cod_cod session, complete in one shot.
//   Card → /api/payment/init has already done address+shipping+Stripe session
//          and the client has confirmed the PaymentIntent via stripe.js, so
//          we just complete the cart.
export async function POST(req: Request) {
  try {
    const cartId = await getCartId();
    if (!cartId) return NextResponse.json({ error: "No cart" }, { status: 400 });

    const body = (await req.json()) as PlacePayload;

    const ALLOWED = new Set(["card", "cod"]);
    const method = body.payment_method ?? "card";
    if (!ALLOWED.has(method)) {
      return NextResponse.json({ error: `Unknown payment_method "${method}"` }, { status: 400 });
    }

    if (method === "cod") {
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
        fields: "id,*payment_collection,payment_collection.payment_sessions.*",
      });
      // If the user previously selected Card and then switched to COD, the cart
      // still carries a Stripe payment session. Calling cart.complete() against
      // a Stripe session that the customer never confirmed produces:
      //   "Session: paysess_X was not authorized with the provider".
      // Re-initiating the session for pp_cod_cod replaces whatever's there so
      // cart.complete() authorizes against the COD provider (which is a no-op
      // success). Always do this on the COD branch, regardless of prior state.
      await sdk.store.payment.initiatePaymentSession(cartFresh.cart, { provider_id: "pp_cod_cod" });
    }

    // For card, the client-side stripe.confirmPayment has already authorized
    // the session. Medusa's webhook will move the payment to authorized state
    // when Stripe fires payment_intent.succeeded — but cart.complete() also
    // re-checks the session status against Stripe, so completing here works.
    const result = await sdk.store.cart.complete(cartId);
    if (result.type === "order") {
      const res = NextResponse.json({ ok: true, orderId: result.order.id });
      // Clear cookie + bust layout cache so header re-fetches an empty cart.
      // Path must match the original cookie's path (set in /api/cart) for the
      // delete to actually take effect across subsequent requests.
      res.cookies.set({
        name: CART_COOKIE,
        value: "",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
      });
      revalidatePath("/", "layout");
      return res;
    }
    return NextResponse.json(
      { ok: false, error: result.error?.message ?? "Checkout failed" },
      { status: 400 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/checkout] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
