import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sdk } from "@/lib/medusa/client";
import { getRegionId } from "@/lib/medusa/server";

const CART_COOKIE = "onelink_cart_id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const cartCookieOptions = {
  maxAge: CART_COOKIE_MAX_AGE,
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// Fields the storefront client needs for the cart drawer + count badge.
const CART_FIELDS = [
  "id",
  "currency_code",
  "subtotal",
  "shipping_total",
  "total",
  "*items",
  "items.product_handle",
  "items.product_title",
  "items.variant_title",
  "items.thumbnail",
  "items.unit_price",
  "items.quantity",
  "items.total",
].join(",");

async function getCartId(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(CART_COOKIE)?.value;
}

async function ensureCart(): Promise<string> {
  const existing = await getCartId();
  if (existing) {
    try {
      const { cart } = await sdk.store.cart.retrieve(existing, { fields: "id,completed_at" });
      if (cart && !cart.completed_at) return cart.id;
    } catch {
      /* fall through and create new */
    }
  }
  const regionId = await getRegionId();
  if (!regionId) throw new Error("No region configured");
  const { cart } = await sdk.store.cart.create({ region_id: regionId });
  return cart.id;
}

// GET — current cart for the SWR client hook. Returns `{ cart: null }` when
// the visitor has no cart cookie (no Medusa round trip needed).
export async function GET() {
  try {
    const cartId = await getCartId();
    if (!cartId) return NextResponse.json({ cart: null });
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS });
    if (!cart || cart.completed_at) {
      const res = NextResponse.json({ cart: null });
      res.cookies.delete(CART_COOKIE);
      return res;
    }
    return NextResponse.json({ cart });
  } catch {
    return NextResponse.json({ cart: null });
  }
}

// PUT — warmup. Creates the cart cookie ahead of the first add-to-cart so
// the click handler doesn't pay the cart-creation tax. Idempotent: if a
// cart already exists, returns it.
export async function PUT() {
  try {
    const cartId = await ensureCart();
    const res = NextResponse.json({ ok: true, cartId });
    res.cookies.set(CART_COOKIE, cartId, cartCookieOptions);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

interface AddPayload {
  variant_id: string;
  quantity?: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AddPayload;
    if (!body.variant_id) {
      return NextResponse.json({ error: "variant_id is required" }, { status: 400 });
    }
    const cartId = await ensureCart();
    await sdk.store.cart.createLineItem(cartId, {
      variant_id: body.variant_id,
      quantity: body.quantity ?? 1,
    });
    // Re-fetch so the client gets the fresh cart in the same round-trip and
    // can pre-populate its SWR cache without a follow-up GET.
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS });
    const res = NextResponse.json({ ok: true, cart });
    res.cookies.set(CART_COOKIE, cartId, cartCookieOptions);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/cart] POST error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

interface PatchPayload {
  line_item_id: string;
  quantity: number;
}

export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as PatchPayload;
    const cartId = await getCartId();
    if (!cartId) {
      return NextResponse.json({ error: "No cart" }, { status: 400 });
    }
    if (body.quantity <= 0) {
      await sdk.store.cart.deleteLineItem(cartId, body.line_item_id);
    } else {
      await sdk.store.cart.updateLineItem(cartId, body.line_item_id, { quantity: body.quantity });
    }
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS });
    return NextResponse.json({ ok: true, cart });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const lineItemId = url.searchParams.get("line_item_id");
    if (!lineItemId) {
      return NextResponse.json({ error: "line_item_id is required" }, { status: 400 });
    }
    const cartId = await getCartId();
    if (!cartId) {
      return NextResponse.json({ error: "No cart" }, { status: 400 });
    }
    await sdk.store.cart.deleteLineItem(cartId, lineItemId);
    const { cart } = await sdk.store.cart.retrieve(cartId, { fields: CART_FIELDS });
    return NextResponse.json({ ok: true, cart });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
