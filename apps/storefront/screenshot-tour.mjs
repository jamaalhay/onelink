import { chromium } from "playwright";

const pages = [
  { path: "/", file: "home.png" },
  { path: "/shop", file: "shop.png" },
  { path: "/shop/vapes", file: "shop-vapes.png" },
  { path: "/products/elf-bar-bc5000-grape-ice", file: "pdp.png" },
  { path: "/cart", file: "cart.png" },
  { path: "/checkout", file: "checkout.png" },
  { path: "/order/ord_demo_001/success", file: "order-success.png" },
  { path: "/track/ord_demo_001", file: "track.png" },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
await ctx.addCookies([
  { name: "onelink_age_ok", value: "1", url: "http://localhost:3001" },
]);
const page = await ctx.newPage();

for (const p of pages) {
  const url = `http://localhost:3001${p.path}`;
  process.stdout.write(`${p.path} ... `);
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.screenshot({
    path: `/tmp/onelink-spec/page-${p.file}`,
    fullPage: true,
    timeout: 30000,
  });
  console.log("ok");
}

await browser.close();
console.log("Done.");
