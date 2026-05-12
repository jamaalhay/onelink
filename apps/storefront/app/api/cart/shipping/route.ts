import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sdk } from "@/lib/medusa/client";

const CART_COOKIE = "onelink_cart_id";

async function getCartId(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(CART_COOKIE)?.value;
}

export async function POST(req: Request) {
  try {
    const cartId = await getCartId();
    if (!cartId) return NextResponse.json({ ok: false, error: "No cart" }, { status: 400 });

    const body = (await req.json().catch(() => ({}))) as { shipping_option_id?: string };
    if (!body.shipping_option_id) {
      return NextResponse.json({ ok: false, error: "Missing shipping zone" }, { status: 400 });
    }

    await sdk.store.cart.addShippingMethod(cartId, { option_id: body.shipping_option_id });
    revalidatePath("/checkout");
    revalidatePath("/cart");

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/cart/shipping] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
