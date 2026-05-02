"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sdk } from "./client";
import { getRegionId } from "./server";

const CART_COOKIE = "onelink_cart_id";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const CART_FIELDS = [
  "id",
  "currency_code",
  "subtotal",
  "tax_total",
  "shipping_total",
  "total",
  "discount_total",
  "*items",
  "items.product_id",
  "items.variant_id",
  "items.product_handle",
  "items.product_title",
  "items.variant_title",
  "items.thumbnail",
  "items.unit_price",
  "items.quantity",
  "items.subtotal",
  "items.total",
  "*shipping_address",
  "*billing_address",
  "*shipping_methods",
  "shipping_methods.shipping_option_id",
  "*payment_collection",
  "payment_collection.payment_sessions.*",
  "*region",
].join(",");

async function getCartIdCookie(): Promise<string | undefined> {
  const c = await cookies();
  return c.get(CART_COOKIE)?.value;
}

async function setCartIdCookie(cartId: string): Promise<void> {
  console.log("[medusa.cart] setCartIdCookie", cartId);
  const c = await cookies();
  c.set({
    name: CART_COOKIE,
    value: cartId,
    maxAge: CART_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  console.log("[medusa.cart] cookie set, current value:", c.get(CART_COOKIE)?.value);
}

async function clearCartIdCookie(): Promise<void> {
  const c = await cookies();
  c.delete(CART_COOKIE);
}

/** Returns the active cart, creating one if no cookie/cart exists. */
export async function getOrCreateCart() {
  const existingId = await getCartIdCookie();

  if (existingId) {
    try {
      const { cart } = await sdk.store.cart.retrieve(existingId, {
        fields: CART_FIELDS,
      });
      // If cart was completed (order placed), it's read-only — start fresh.
      if (!cart || cart.completed_at) {
        await clearCartIdCookie();
      } else {
        return cart;
      }
    } catch {
      await clearCartIdCookie();
    }
  }

  const regionId = await getRegionId();
  if (!regionId) {
    throw new Error("[medusa.cart] No Jamaica region found — cannot create cart.");
  }
  const { cart } = await sdk.store.cart.create({ region_id: regionId });
  await setCartIdCookie(cart.id);
  // Re-fetch with our full field set
  const fresh = await sdk.store.cart.retrieve(cart.id, { fields: CART_FIELDS });
  return fresh.cart;
}

/** Read the current cart without creating one. Returns null if none. */
export async function getCart() {
  const id = await getCartIdCookie();
  if (!id) return null;
  try {
    const { cart } = await sdk.store.cart.retrieve(id, { fields: CART_FIELDS });
    if (cart?.completed_at) {
      await clearCartIdCookie();
      return null;
    }
    return cart;
  } catch {
    return null;
  }
}

export async function addToCart(variantId: string, quantity = 1): Promise<{ ok: boolean; error?: string }> {
  try {
    const cart = await getOrCreateCart();
    console.log("[medusa.addToCart]", { cartId: cart.id, variantId, quantity });
    await sdk.store.cart.createLineItem(cart.id, { variant_id: variantId, quantity });
    revalidatePath("/cart");
    revalidatePath("/checkout");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[medusa.addToCart] error:", msg);
    return { ok: false, error: msg };
  }
}

export async function updateLineItem(lineItemId: string, quantity: number): Promise<void> {
  const cart = await getCart();
  if (!cart) throw new Error("No cart");
  if (quantity <= 0) return removeLineItem(lineItemId);
  await sdk.store.cart.updateLineItem(cart.id, lineItemId, { quantity });
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
}

export async function removeLineItem(lineItemId: string): Promise<void> {
  const cart = await getCart();
  if (!cart) throw new Error("No cart");
  await sdk.store.cart.deleteLineItem(cart.id, lineItemId);
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
}

export async function applyShippingAddress(address: {
  first_name: string;
  last_name?: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city?: string;
  province?: string;
  country_code: string;
  postal_code?: string;
}) {
  const cart = await getCart();
  if (!cart) throw new Error("No cart");
  await sdk.store.cart.update(cart.id, {
    email: undefined,
    shipping_address: {
      first_name: address.first_name,
      last_name: address.last_name ?? "",
      phone: address.phone,
      address_1: address.address_1,
      address_2: address.address_2 ?? "",
      city: address.city ?? "Kingston",
      country_code: address.country_code,
      postal_code: address.postal_code,
      province: address.province ?? "Kingston",
    },
    billing_address: {
      first_name: address.first_name,
      last_name: address.last_name ?? "",
      phone: address.phone,
      address_1: address.address_1,
      address_2: address.address_2 ?? "",
      city: address.city ?? "Kingston",
      country_code: address.country_code,
      postal_code: address.postal_code,
      province: address.province ?? "Kingston",
    },
  });
  revalidatePath("/checkout");
}

export async function selectShippingOption(optionId: string) {
  const cart = await getCart();
  if (!cart) throw new Error("No cart");
  await sdk.store.cart.addShippingMethod(cart.id, { option_id: optionId });
  revalidatePath("/checkout");
}

export async function listShippingOptions() {
  const cart = await getCart();
  if (!cart) return [];
  try {
    const res = await sdk.store.fulfillment.listCartOptions({ cart_id: cart.id });
    return res.shipping_options;
  } catch (err) {
    console.error("[medusa.cart.listShippingOptions]", err);
    return [];
  }
}

export async function initPayment() {
  const cart = await getCart();
  if (!cart) throw new Error("No cart");
  // Initialize a payment collection if not present
  try {
    const { payment_collection } = await sdk.store.payment.initiatePaymentSession(
      cart,
      {
        provider_id: "pp_system_default",
      }
    );
    return payment_collection;
  } catch (err) {
    console.error("[medusa.cart.initPayment]", err);
    throw err;
  }
}

export async function placeOrder() {
  const cart = await getCart();
  if (!cart) throw new Error("No cart");

  // Ensure a payment session exists.
  if (!cart.payment_collection?.payment_sessions?.length) {
    await initPayment();
  }

  const result = await sdk.store.cart.complete(cart.id);
  if (result.type === "order") {
    await clearCartIdCookie();
    return { ok: true, orderId: result.order.id };
  }
  return { ok: false, error: result.error?.message ?? "Checkout failed" };
}

export async function applyCustomerInfo(input: { email?: string; phone?: string }) {
  const cart = await getCart();
  if (!cart) throw new Error("No cart");
  const update: Record<string, unknown> = {};
  if (input.email) update.email = input.email;
  await sdk.store.cart.update(cart.id, update);
  revalidatePath("/checkout");
}
