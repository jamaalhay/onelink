import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/tmp/onelink-spec/walkthrough-shots";
mkdirSync(OUT, { recursive: true });

// Place a real Medusa order so the success + track screenshots have a live order to render.
async function placeDemoOrder() {
  // 1. fetch a variant + shipping option from Medusa
  const variantsRes = await fetch(`${BASE}/api/_introspect-variant`).catch(() => null);
  // We don't have an introspect endpoint — query via storefront's product list API directly
  const productsRes = await fetch("http://localhost:9000/store/products?limit=1&fields=id,*variants", {
    headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_f81754f6dec7ffd80dc95b067a3695058f36f3adec575118d6cf2a9000752abe" },
  });
  const productsJson = await productsRes.json();
  const variantId = productsJson.products?.[0]?.variants?.[0]?.id;
  if (!variantId) throw new Error("No variant found in Medusa");

  // Get a shipping option
  const optsRes = await fetch("http://localhost:9000/store/shipping-options", {
    headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_f81754f6dec7ffd80dc95b067a3695058f36f3adec575118d6cf2a9000752abe" },
  }).catch(() => null);

  // Use a fresh cookie jar via direct Medusa SDK calls would be cleaner, but a
  // simpler approach: place via our /api/cart + /api/checkout
  const cookies = [];
  const captureCookies = (res) => {
    const sc = res.headers.get("set-cookie");
    if (sc) cookies.push(sc.split(";")[0]);
  };

  const addRes = await fetch(`${BASE}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
  });
  captureCookies(addRes);

  const cookieHeader = cookies.join("; ");

  // List shipping options for this cart via storefront fulfillment endpoint
  const shipRes = await fetch("http://localhost:9000/store/shipping-options?cart_id=" + encodeURIComponent((await addRes.json()).cartId), {
    headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_f81754f6dec7ffd80dc95b067a3695058f36f3adec575118d6cf2a9000752abe" },
  });
  const shipJson = await shipRes.json();
  const shippingOptionId = shipJson.shipping_options?.find((o) => o.name?.startsWith("Onelink"))?.id;
  if (!shippingOptionId) throw new Error("No Onelink shipping option");

  const placeRes = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({
      customer: { name: "Demo Customer", phone: "+18761234567" },
      address: { street: "1 Walkthrough Way" },
      shipping_option_id: shippingOptionId,
      payment_method: "card",
    }),
  });
  const placeJson = await placeRes.json();
  if (!placeJson.ok) throw new Error("Demo order failed: " + JSON.stringify(placeJson));
  return placeJson.orderId;
}

// 1) Pick a real product handle from Medusa for the PDP shot
async function firstProductHandle() {
  const res = await fetch("http://localhost:9000/store/products?limit=1&fields=handle", {
    headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_f81754f6dec7ffd80dc95b067a3695058f36f3adec575118d6cf2a9000752abe" },
  });
  const data = await res.json();
  return data.products?.[0]?.handle ?? "vuse-go-1000-grape-ice";
}

const productHandle = await firstProductHandle();
console.log(`Using PDP handle: ${productHandle}`);

const orderId = await placeDemoOrder();
console.log(`Placed demo order: ${orderId}`);

const pages = [
  { path: "/",                                     file: "01-home.png" },
  { path: "/shop",                                 file: "02-shop.png" },
  { path: `/products/${productHandle}`,            file: "03-pdp.png" },
  { path: "/cart",                                 file: "04-cart.png", openCartDrawer: true, drawerFile: "04a-cart-drawer.png" },
  { path: "/checkout",                             file: "05-checkout.png" },
  { path: `/order/${orderId}/success`,             file: "06-success.png" },
  { path: `/track/${orderId}`,                     file: "07-track.png" },
];

const HIDE_DEV_AFFORDANCES = `
  #onelink-demo-nav { display: none !important; }
  nextjs-portal, [data-nextjs-toast], [data-next-mark-loading] { display: none !important; }
`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
await ctx.addCookies([
  { name: "onelink_age_ok", value: "1", url: BASE },
]);
await ctx.addInitScript(() => {
  const s = document.createElement("style");
  s.textContent = `
    #onelink-demo-nav { display: none !important; }
    nextjs-portal, [data-nextjs-toast] { display: none !important; }
  `;
  if (document.head) document.head.appendChild(s);
  else document.addEventListener("DOMContentLoaded", () => document.head.appendChild(s));
});
// Add a fresh cart with item so /cart and /checkout render content
const cartRes = await fetch(`${BASE}/api/cart`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    variant_id: (await (await fetch("http://localhost:9000/store/products?limit=1&fields=id,*variants", { headers: { "x-publishable-api-key": "pk_f81754f6dec7ffd80dc95b067a3695058f36f3adec575118d6cf2a9000752abe" } })).json()).products[0].variants[0].id,
    quantity: 2,
  }),
});
const cartCookie = cartRes.headers.get("set-cookie")?.split(";")[0];
if (cartCookie) {
  const [name, value] = cartCookie.split("=");
  await ctx.addCookies([{ name, value, url: BASE }]);
}
const page = await ctx.newPage();

for (const p of pages) {
  process.stdout.write(`${p.path} ... `);
  try {
    await page.goto(`${BASE}${p.path}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.addStyleTag({ content: HIDE_DEV_AFFORDANCES });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${p.file}`, fullPage: true, timeout: 30000 });
    console.log("ok");

    if (p.openCartDrawer) {
      process.stdout.write(`  ↪ open cart drawer ... `);
      await page.locator('button[aria-label="Open cart"]').first().click();
      await page.waitForSelector('[data-slot="sheet-content"]', { state: "visible", timeout: 5000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}/${p.drawerFile}`, fullPage: false, timeout: 30000 });
      console.log("ok");
    }
  } catch (err) {
    console.log(`FAIL: ${err.message?.slice(0, 80)}`);
  }
}

await browser.close();
console.log(`Done. Screens in ${OUT}`);
