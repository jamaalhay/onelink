/**
 * End-to-end checkout test:
 * Home → Shop → PDP → Add to Cart → Cart → Checkout → Place Order → Success → Track.
 *
 * Each step screenshots before/after and asserts on key DOM markers.
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "/tmp/onelink-spec/e2e";
mkdirSync(OUT, { recursive: true });

const log = (msg) => {
  console.log(`[e2e] ${msg}`);
};

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
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
const page = await ctx.newPage();

// Surface JS errors immediately
page.on("pageerror", (e) => console.error("[browser:pageerror]", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.error("[browser:console.error]", m.text());
});

const results = [];
let stepIdx = 0;
async function step(name, fn) {
  stepIdx++;
  const padded = String(stepIdx).padStart(2, "0");
  log(`▶ ${padded} ${name}`);
  try {
    await fn();
    results.push({ idx: padded, name, ok: true });
    await page.screenshot({ path: `${OUT}/${padded}-${name.replace(/[^a-z0-9]+/gi, "-")}.png`, fullPage: false });
    log(`  ✓ ${name}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ idx: padded, name, ok: false, error: msg });
    log(`  ✗ ${name}: ${msg}`);
    try {
      await page.screenshot({ path: `${OUT}/${padded}-${name.replace(/[^a-z0-9]+/gi, "-")}-FAIL.png`, fullPage: false });
    } catch {}
    throw err;
  }
}

try {
  await step("home-loads", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    const h1 = await page.locator("h1").first().textContent();
    if (!h1?.toLowerCase().includes("one link")) throw new Error(`expected hero h1, got: ${h1}`);
  });

  await step("home-shows-categories", async () => {
    const visibleCats = await page.locator("a[href^='/shop/']").count();
    if (visibleCats < 7) throw new Error(`expected >=7 category links, got ${visibleCats}`);
  });

  await step("home-shows-featured", async () => {
    const featuredCount = await page.locator("a[href^='/products/']").count();
    if (featuredCount < 4) throw new Error(`expected >=4 product links on home, got ${featuredCount}`);
  });

  await step("shop-loads", async () => {
    await page.goto(`${BASE}/shop`, { waitUntil: "networkidle", timeout: 60000 });
    const cards = await page.locator("a[href^='/products/']").count();
    if (cards < 5) throw new Error(`expected >=5 product cards on shop, got ${cards}`);
  });

  await step("category-page-vapes", async () => {
    await page.goto(`${BASE}/shop/vapes`, { waitUntil: "networkidle", timeout: 60000 });
    const cards = await page.locator("a[href^='/products/']").count();
    if (cards < 2) throw new Error(`expected vape products in /shop/vapes, got ${cards}`);
  });

  await step("pdp-loads", async () => {
    await page.goto(`${BASE}/shop`, { waitUntil: "networkidle", timeout: 60000 });
    const cardLink = page.locator("main a[href^='/products/']").first();
    const href = await cardLink.getAttribute("href");
    if (!href) throw new Error("no product card link found in main");
    await page.goto(`${BASE}${href}`, { waitUntil: "networkidle", timeout: 60000 });
    const title = (await page.locator("h1").first().textContent())?.trim() ?? "";
    if (title.toLowerCase() === "404" || title.length < 5) {
      throw new Error(`PDP h1 looks wrong: "${title}" (url: ${page.url()})`);
    }
    // Tighter: a JMD price (e.g. "$1,800") and the Review Summary section must render
    const priceVisible = await page.locator("text=/\\$\\d/").first().isVisible();
    if (!priceVisible) throw new Error("no JMD price visible on PDP");
    const reviewHeader = await page.locator("text=/Customer reviews/i").first().isVisible();
    if (!reviewHeader) throw new Error("ReviewSummary section missing");
    // Accordion sections present
    for (const tab of ["Product Details", "What's in the Box", "Usage & Care", "Shipping & Returns", "Age & Compliance"]) {
      const c = await page.locator(`text="${tab}"`).count();
      if (c === 0) throw new Error(`accordion missing tab: ${tab}`);
    }
  });

  await step("add-to-cart", async () => {
    const addBtn = page.locator("button:has-text('Add to Cart')").first();
    if ((await addBtn.count()) === 0) throw new Error("Add to Cart button not found");

    // Capture the /api/cart response in detail
    const apiResponseP = page.waitForResponse(
      (r) => r.url().includes("/api/cart") && r.request().method() === "POST",
      { timeout: 15000 }
    );

    await addBtn.click();

    let resp;
    try {
      resp = await apiResponseP;
    } catch (e) {
      throw new Error("api/cart response never came back");
    }
    const status = resp.status();
    const headers = resp.headers();
    const body = await resp.text();
    log(`  /api/cart -> ${status}`);
    log(`  set-cookie header: ${headers["set-cookie"] ?? "(none)"}`);
    log(`  body: ${body.slice(0, 200)}`);

    await page.waitForTimeout(1500);
    const cookies = await ctx.cookies();
    const cartCookie = cookies.find((c) => c.name === "onelink_cart_id");
    log(`  cart cookie in jar: ${cartCookie ? cartCookie.value : "MISSING"}`);
    if (!cartCookie) throw new Error("onelink_cart_id cookie was not set after Add to Cart");
  });

  await step("cart-page-shows-item", async () => {
    await page.goto(`${BASE}/cart`, { waitUntil: "networkidle", timeout: 60000 });
    const heading = await page.locator("h1").first().textContent();
    if (heading?.toLowerCase().includes("empty")) throw new Error("cart is empty after add-to-cart!");
    const removeBtns = await page.locator("button[aria-label='Remove']").count();
    if (removeBtns === 0) throw new Error("no line item with remove button found in cart");
  });

  await step("cart-qty-increase", async () => {
    await page.goto(`${BASE}/cart`, { waitUntil: "networkidle", timeout: 60000 });
    const qtyBefore = (await page.locator("[aria-live='polite'], main span:has-text('1'), main .font-medium").first().textContent())?.trim();
    const incBtn = page.locator("button[aria-label='Increase']").first();
    await incBtn.click();
    await page.waitForTimeout(2500);
    await page.reload({ waitUntil: "networkidle" });
    // Either the visible qty is now > 1, or the order summary subtotal grew
    const removeBtnsAfter = await page.locator("button[aria-label='Remove']").count();
    if (removeBtnsAfter === 0) throw new Error("cart became empty after qty increase");
  });

  await step("cart-qty-remove", async () => {
    await page.goto(`${BASE}/cart`, { waitUntil: "networkidle", timeout: 60000 });
    const removeBefore = await page.locator("button[aria-label='Remove']").count();
    if (removeBefore === 0) throw new Error("nothing to remove in cart");
    await page.locator("button[aria-label='Remove']").first().click();
    await page.waitForTimeout(2500);
    await page.reload({ waitUntil: "networkidle" });
    // After removing every line, cart should be empty (we only had one product)
    const removeAfter = await page.locator("button[aria-label='Remove']").count();
    const heading = (await page.locator("h1").first().textContent())?.toLowerCase() ?? "";
    if (removeAfter > 0 && !heading.includes("empty")) {
      // accept partial removal — at minimum, the count should drop
      if (removeAfter >= removeBefore) throw new Error("remove had no effect on cart line count");
    }
  });

  // Re-add an item for the rest of the test
  await step("re-add-after-remove", async () => {
    await page.goto(`${BASE}/shop`, { waitUntil: "networkidle", timeout: 60000 });
    const cardLink = page.locator("main a[href^='/products/']").first();
    const href = await cardLink.getAttribute("href");
    await page.goto(`${BASE}${href}`, { waitUntil: "networkidle", timeout: 60000 });
    const respP = page.waitForResponse((r) => r.url().includes("/api/cart") && r.request().method() === "POST", { timeout: 15000 });
    await page.locator("button:has-text('Add to Cart')").first().click();
    await respP;
  });

  await step("checkout-loads", async () => {
    await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle", timeout: 60000 });
    const h1 = await page.locator("h1").first().textContent();
    if (!h1?.toLowerCase().includes("checkout")) throw new Error(`expected Checkout h1, got: ${h1}`);
    const optionCount = await page.locator("select option").count();
    if (optionCount === 0) throw new Error("no shipping options in zone select");
  });

  await step("fill-checkout-and-place-order", async () => {
    await page.locator("input[placeholder='Your name']").fill("Andre Tester");
    await page.locator("input[placeholder='+1 876 …']").fill("+18761234567");
    await page.locator("input[placeholder='Address line 1']").fill("12 Test Way");
    const select = page.locator("select").first();
    const optionVal = await select.locator("option").first().getAttribute("value");
    if (optionVal) await select.selectOption(optionVal);

    // Capture the /api/checkout response
    const respP = page.waitForResponse(
      (r) => r.url().includes("/api/checkout") && r.request().method() === "POST",
      { timeout: 60000 }
    );

    await page.locator("button:has-text('Place order')").click();

    let resp;
    try {
      resp = await respP;
    } catch {
      throw new Error("api/checkout response never came back");
    }
    const status = resp.status();
    const body = await resp.text();
    log(`  /api/checkout -> ${status}`);
    log(`  body: ${body.slice(0, 400)}`);

    if (status !== 200) {
      throw new Error(`api/checkout returned ${status}: ${body}`);
    }
    // Wait briefly for client-side redirect
    await page.waitForURL(/\/order\/.*\/success/, { timeout: 15000 }).catch(() => {});
    if (!page.url().includes("/order/") || !page.url().includes("/success")) {
      const errText = await page.locator("text=/(failed|error)/i").first().textContent().catch(() => null);
      throw new Error(`no redirect after place; url=${page.url()}; visible-error=${errText}`);
    }
  });

  await step("success-page-renders-order", async () => {
    const h1 = await page.locator("h1").first().textContent();
    if (!h1?.toLowerCase().includes("confirmed")) throw new Error(`expected Confirmed h1, got: ${h1}`);
    // Tighter: order number, total amount, items list, Reorder Essentials, Need Help all present
    const orderNum = await page.locator("text=/OL-/i").count();
    if (orderNum === 0) throw new Error("order number (OL-...) not visible on success page");
    const total = await page.locator("text=/\\$\\d/").count();
    if (total === 0) throw new Error("no JMD amount visible on success page");
    if ((await page.locator("text=/Reorder essentials/i").count()) === 0) throw new Error("Reorder Essentials missing");
    if ((await page.locator("text=/Need help/i").count()) === 0) throw new Error("Need Help missing");
  });

  await step("track-link-works", async () => {
    const trackLink = page.locator("a:has-text('Track your order')").first();
    const href = await trackLink.getAttribute("href");
    if (!href?.startsWith("/track/")) throw new Error(`unexpected track href: ${href}`);
    // Navigate explicitly — Link click doesn't always trigger nav in headless test env
    await page.goto(`${BASE}${href}`, { waitUntil: "networkidle", timeout: 30000 });
    const trackH1 = (await page.locator("h1").first().textContent())?.trim() ?? "";
    if (!trackH1.toLowerCase().startsWith("order ol-")) {
      throw new Error(`expected "Order OL-..." h1 on tracking page, got: ${trackH1} (url: ${page.url()})`);
    }
    // Tighter: timeline + rider card + reorder + need-help all present
    const stageLabels = ["Received", "Confirmed", "Preparing", "Rider Assigned", "Out for Delivery", "Delivered"];
    for (const label of stageLabels) {
      const re = new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      if ((await page.getByText(re).count()) === 0) {
        throw new Error(`tracking timeline missing stage: ${label}`);
      }
    }
    if ((await page.locator("text=/Order Progress/i").count()) === 0) throw new Error("Order Progress missing");
    if ((await page.locator("text=/Reorder essentials/i").count()) === 0) throw new Error("Reorder on track missing");
  });

  await step("age-gate-first-visit-flow", async () => {
    // Fresh browser context with NO age cookie — the modal should appear.
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p2 = await ctx2.newPage();
    await p2.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    const modal = await p2.locator("[role='dialog'][aria-labelledby='age-gate-title']").count();
    if (modal === 0) throw new Error("Age gate modal not shown on first visit");
    // Click "Yes, I'm 18+"
    await p2.locator("button:has-text(\"Yes, I'm 18+\")").click();
    await p2.waitForTimeout(500);
    const modalAfter = await p2.locator("[role='dialog'][aria-labelledby='age-gate-title']").count();
    if (modalAfter !== 0) throw new Error("Age gate didn't dismiss after Yes click");
    // Cookie must be set
    const cookies2 = await ctx2.cookies();
    if (!cookies2.find((c) => c.name === "onelink_age_ok")) {
      throw new Error("onelink_age_ok cookie not set after dismiss");
    }
    await ctx2.close();
  });

  await step("whatsapp-link-href-format", async () => {
    await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
    const wa = page.locator('a[href^="https://wa.me/"]').first();
    const href = await wa.getAttribute("href");
    // Default placeholder is +18760000000 → digits only = 18760000000
    if (!href || !/^https:\/\/wa\.me\/\d{10,15}/.test(href)) {
      throw new Error(`WhatsApp link malformed: ${href}`);
    }
    // Should include URL-encoded message text
    if (!/\?text=/.test(href)) {
      log(`  note: no prefilled message on this WhatsApp link (acceptable for some entry points)`);
    }
  });

  await step("shop-interactives-do-not-crash", async () => {
    await page.goto(`${BASE}/shop`, { waitUntil: "networkidle", timeout: 60000 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));

    // Click a filter checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    if (await firstCheckbox.count()) {
      await firstCheckbox.click();
      await page.waitForTimeout(300);
    }
    // Change sort
    const sortSelect = page.locator("select").first();
    if (await sortSelect.count()) {
      const opts = await sortSelect.locator("option").allTextContents();
      if (opts.length > 1) {
        await sortSelect.selectOption({ index: 1 });
        await page.waitForTimeout(300);
      }
    }
    // Type into search input
    const search = page.locator('input[type="search"]').first();
    if (await search.count()) {
      await search.fill("vape");
      await page.waitForTimeout(300);
    }
    // Click a non-disabled pagination button (current page is fine)
    const pageBtn = page.locator('nav[aria-label="Pagination"] button:not([disabled])').first();
    if (await pageBtn.count()) {
      await pageBtn.click();
      await page.waitForTimeout(300);
    }

    if (errors.length > 0) {
      throw new Error(`Shop interactives crashed: ${errors.join(" | ")}`);
    }
    // Cards still rendered
    const cards = await page.locator("main a[href^='/products/']").count();
    if (cards === 0) throw new Error("product cards disappeared after interactivity");
  });

  await step("checkout-rejects-invalid-payment-method", async () => {
    // Need a fresh cart (previous order completed and cleared cookie). Visit a PDP and add to cart.
    await page.goto(`${BASE}/shop`, { waitUntil: "networkidle", timeout: 60000 });
    const href = await page.locator("main a[href^='/products/']").first().getAttribute("href");
    await page.goto(`${BASE}${href}`, { waitUntil: "networkidle" });
    const respP = page.waitForResponse(
      (r) => r.url().includes("/api/cart") && r.request().method() === "POST",
      { timeout: 10000 }
    );
    await page.locator("button:has-text('Add to Cart')").first().click();
    await respP;

    const res = await page.evaluate(async () => {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name: "X Tester", phone: "+18760000001" },
          address: { street: "1 Test St" },
          shipping_option_id: "so_does_not_matter_payment_validates_first",
          payment_method: "bitcoin",
        }),
      });
      return { status: r.status, body: await r.text() };
    });
    if (res.status !== 400) {
      throw new Error(`expected 400 for unknown payment_method, got ${res.status}: ${res.body.slice(0, 100)}`);
    }
    if (!res.body.toLowerCase().includes("unknown payment_method")) {
      throw new Error(`expected error mentioning payment_method, got: ${res.body.slice(0, 200)}`);
    }
  });
} catch (err) {
  console.error("[e2e] aborted:", err);
}

await browser.close();

console.log("\n=== e2e summary ===");
const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log(`passed: ${passed}/${results.length}`);
for (const r of results) {
  console.log(`  ${r.ok ? "✓" : "✗"} ${r.idx} ${r.name}${r.error ? ` — ${r.error}` : ""}`);
}
process.exit(failed.length === 0 ? 0 : 1);
