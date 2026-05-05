# Onelink — Pre-launch Test Plan

> Hand this to whoever is QA'ing the site. Should take ~60-90 minutes for a thorough pass.

## Setup

- **Storefront:** `https://onelinkjm.com`
- **Admin:** `https://api.onelinkjm.com/app` (creds at `/tmp/onelink-spec/medusa-admin-creds.txt`)
- **Sanity Studio:** `https://onelinkjm.com/studio` (skip unless authoring CMS content)
- **What you'll need:**
  - A **real credit/debit card** — Stripe is in **live mode**, so charges are real. Capture them in admin only if you want them collected; refund after.
  - A **real Jamaican phone number** that can receive SMS.
  - A **real email** address to receive order confirmations.
  - Test on **Chrome (desktop) and a phone** (iOS Safari or Android Chrome).
- **Tip:** open the admin orders page in a separate tab so you can watch orders/payments roll in as you test the storefront.

For each issue, capture: **page URL**, **what you did**, **what you expected**, **what happened**, **screenshot** if it's visual.

---

## A. Storefront — first visit + browsing

### A1. First visit
- [ ] Land on `/`. Age gate modal appears ("Are you 18 or older?"). Click **Yes, I'm 18+** → modal dismisses, doesn't reappear on subsequent visits within 30 days.
- [ ] Top delivery bar reads "Delivering to **New Kingston** · ETA **15–30 min**".
- [ ] Hero reads "One link. Endless **possibilities**." with the accent on "possibilities".
- [ ] Footer renders with all category and customer-care links.

### A2. Zone change
- [ ] Click **Change** in the top delivery bar → dialog opens listing all 10 zones (New Kingston, Half Way Tree, Liguanea, Barbican, Cherry Gardens, Stony Hill, Constant Spring, Papine, Harbour View, Portmore) with ETA and fee.
- [ ] Pick **Stony Hill** → dialog closes → top bar updates to "Delivering to Stony Hill · ETA 30–45 min".
- [ ] Close the tab, reopen `/` → still shows Stony Hill (cookie persists).

### A3. Browsing
- [ ] Header → **Shop** → `/shop` lists all 16 products. Sort dropdown is visible.
- [ ] Header → **Categories** → loads `/shop/vapes` (4-5 products visible).
- [ ] Click any category chip → URL updates to `/shop/<slug>`, products filter.
- [ ] Click any product card → PDP loads with: hero image, title, price in JMD, brand, "In stock" badge, description, **Add to Cart** button, variant picker (only on Vuse Go and ZYN Cool Mint), reviews section, "More from <category>" related products.

### A4. Variants
- [ ] Open `/products/vuse-go-1000-grape-ice` → variant picker shows **Grape Ice** / **Blue Razz Ice** / **Watermelon**.
- [ ] Click each one → only the clicked variant has the accent border. Price stays the same.

### A5. Search
- [ ] Click magnifying-glass icon in header → search dialog opens.
- [ ] Type **elf** → results appear within ~100ms.
- [ ] Click a result → PDP loads.
- [ ] Search dialog also closes on Escape key.

---

## B. Storefront — checkout

### B1. Add to cart (PDP)
- [ ] Pick a product, click **Add to Cart** → button shows "Added to cart" briefly, cart badge in header bumps to **1**.
- [ ] Click cart icon → drawer opens with: item thumbnail, title, qty, line total, subtotal, "Set at checkout" for delivery, **Proceed to Checkout** button.

### B2. Cart edits
- [ ] Drawer → click `+` to bump qty → line total updates, drawer recalculates.
- [ ] Click `-` to decrease.
- [ ] Click trash icon → item removes; if empty, drawer shows "Your cart is empty" with **Browse the shop**.
- [ ] Re-add 2 different products → drawer shows both, totals correct.
- [ ] Open `/cart` (full page) → same data as drawer.

### B3. Cart persistence
- [ ] Close browser entirely, reopen `/cart` → cart still has the items (cookie persists 30 days).

### B4. Checkout — card path
- [ ] Cart drawer → **Proceed to Checkout** → `/checkout` loads with stepper at **Payment**.
- [ ] Fill: full name, phone (real JM number), email (real inbox).
- [ ] Fill: street address, optional landmark.
- [ ] Pick a **Delivery zone** from dropdown.
- [ ] Tick **Send updates via WhatsApp** under Order Updates *(falls back to SMS today — see Known issues)*.
- [ ] Pick **Card payment** → Stripe Element renders. Enter real card.
- [ ] Click **Place order** → after a few seconds, redirects to `/order/<id>/success`.
- [ ] Success page shows: order number `OL-XXXXXX`, total, payment label "Card · Paid", track-order button.

### B5. Checkout — COD path
- [ ] Repeat from a fresh cart → at Payment, pick **Cash on Delivery** instead.
- [ ] Stripe Element disappears.
- [ ] Click **Place order** → redirect to success page → payment label "Cash on Delivery".

### B6. Notifications
- [ ] **SMS** arrives on the JM number within ~30s with the order number + tracking URL.
- [ ] **Email** arrives at the inbox with the order summary HTML.
- [ ] **Check spam folder** if neither arrives in 2 minutes — domain reputation is new.

### B7. Order success page
- [ ] Visit `/order/<id>/success` again later → still loads (not session-bound).
- [ ] **Track your order** button → `/track/<id>` loads.
- [ ] **Continue shopping** button → `/shop` loads.

---

## C. Storefront — post-purchase

### C1. Tracking
- [ ] `/track/<id>` shows: order number, ETA, **Order Progress** timeline, OpenStreetMap embed of the delivery zone, "Rider details on dispatch" placeholder card *(no real rider until dispatch system exists)*, order details (total, payment, items count), reorder essentials, need-help card.
- [ ] `/track` (no id) → input field where you can paste an order id.
- [ ] Click any **Chat on WhatsApp** button → opens WhatsApp web/app *(currently goes to placeholder number — see Known issues)*.

### C2. Reviews
- [ ] Open any PDP. If there are no reviews, you'll see "Be the first to review the <title>" callout.
- [ ] Scroll to **Write a review** form.
- [ ] Click 4 stars → they fill in.
- [ ] Fill name, optional email (use the same email as your test order to get the **Verified buyer** badge), optional title, body (≥10 chars).
- [ ] Click **Post review** → shows "Thanks for the review" success card.
- [ ] Wait ~60s, hard-refresh → your review appears in the list. Latest highlighted at the top, additional ones below.
- [ ] Average rating + distribution bars at the top reflect the new review.
- [ ] Try submitting again with rating=0 → "Please pick a rating" error.
- [ ] Try with body="hi" → "Tell us a bit more — at least 10 characters" error.

### C3. Information pages
Quick render check — open each, confirm no errors, no broken images, all links visible:

- [ ] `/faq`
- [ ] `/shipping`
- [ ] `/returns`
- [ ] `/contact`
- [ ] `/about`
- [ ] `/coverage`
- [ ] `/careers`
- [ ] `/press`
- [ ] `/legal/terms`
- [ ] `/legal/privacy`
- [ ] `/legal/age-policy`

All email links should point to `@onelinkjm.com`. All WhatsApp links point to the support number *(currently placeholder)*.

---

## D. Admin — order management

### D1. Login
- [ ] `/app` → login screen. Use creds from `/tmp/onelink-spec/medusa-admin-creds.txt`.
- [ ] Lands on `/app/orders`.

### D2. Onelink banner widget
- [ ] Navigate to `/app/products` → orange-bordered "Onelink Admin" banner at the top with stats (Region, Zones, Categories, Payment).

### D3. Order list + detail
- [ ] `/app/orders` → table of orders, sortable columns.
- [ ] Click your test order → detail page loads.
- [ ] Detail shows: items + line totals, subtotal, shipping, total, payment status, fulfillment status, customer (name, email, phone), shipping address, billing address, activity timeline.

### D4. Capture payment (card orders only)
- [ ] On a Card order with payment status **Authorized**, click **Capture** → status moves to **Captured**, "Total paid by customer" updates from $0 to the order total. ✅ Money has actually moved.
- [ ] If capture fails, note the error message.

### D5. Fulfillment
- [ ] On any order, find the Fulfillment section → mark as fulfilled / shipped / delivered → activity timeline updates.

### D6. Refund (live-mode test only if you actually captured)
- [ ] On a Captured order → Refund flow (button or menu) → enter amount → confirm → status moves to **Refunded** in admin and money returns to the card within a few hours.

### D7. Customer detail
- [ ] Customers tab → click a customer → see their order history.

---

## E. Admin — product management

### E1. Stock product detail
- [ ] `/app/products` → click any product → detail page with description, media, options, variants table, sales channels, shipping config, categories, attributes.
- [ ] Edit the description → save → wait ~60s → storefront PDP reflects the change.

### E2. Custom 3-step wizard
- [ ] `/app/wizard` → "Add product" stepper renders.
- [ ] **Step 1 — Basic info:** Title (e.g. "Test Soda"), Handle auto-derives, Brand, Short description, pick a Category, Price (whole JMD number, e.g. `300`). Click **Next**.
- [ ] **Step 2 — Media & inventory:** Thumbnail URL (use any public image), Stock count (e.g. `10`). Click **Next**.
- [ ] **Step 3 — Review:** check the summary. Click **Create product** → toast "Product 'Test Soda' created".
- [ ] Open `/app/products` → search "Test" → product is there, status **Published**.
- [ ] Open `https://onelinkjm.com/products/<handle>` → PDP renders with title, price, description, **Add to Cart** button visible (this is the inventory-level fix — verify Add to Cart actually works).
- [ ] Add to cart → confirm cart badge updates.
- [ ] **Cleanup:** back in admin, delete the test product from the product detail page.

### E3. Inventory adjust
- [ ] Open any product detail → Variants section shows "X available at Y location".
- [ ] Adjust stock to 0 → save → storefront PDP shows **Out of Stock**, Add to Cart disabled.
- [ ] Set back to original.

---

## F. Edge cases worth one round each

- [ ] **Stripe declined card**: at checkout, use `4000 0000 0000 0002` → see "Card declined" error inline, page doesn't navigate.
- [ ] **Stripe insufficient funds**: `4000 0000 0000 9995` → similar error.
- [ ] **Empty checkout submission**: leave name blank, hit Place order → "Please fill in your name, phone, and address."
- [ ] **Empty cart at checkout**: navigate to `/checkout` directly with no cart cookie → redirects to `/cart`.
- [ ] **Hard refresh in middle of checkout**: form resets, no zombie state.
- [ ] **Mobile layout**: scroll the home page on a phone → no overflow, all images fit, age gate looks right, cart drawer fills the screen.
- [ ] **Slow connection**: Chrome DevTools → Network tab → throttle to "Slow 4G" → home loads in <3s, PDP in <2s.

---

## G. Analytics + monitoring spot-checks (optional but valuable)

### G1. GA4 events
- [ ] In a separate tab, open GA4 → DebugView (admin → Configure → DebugView).
- [ ] Run through B1–B6 again. Should see in DebugView (within ~30s):
  - `view_item_list` when you open a category
  - `search` when you submit search
  - `view_item` on a PDP
  - `add_to_cart` after Add to Cart
  - `begin_checkout` when checkout loads
  - `add_payment_info` when you flip Card / COD
  - `purchase` after order placement
  - `track_order` when you open the tracking page
  - `whatsapp_click` when you click any WA CTA

### G2. Sentry
- [ ] Open `https://candor-71.sentry.io/issues/?project=onelink-storefront`.
- [ ] No new errors should fire during normal flows.
- [ ] If an error appears, click in → stack trace + breadcrumbs.

---

## H. Known issues — don't bother reporting

These are tracked and being worked on:

- **WhatsApp links point to `+18760000000`** — placeholder until the real number is wired (waiting on Digicel eSIM + Twilio Sender Registration).
- **WhatsApp opt-in at checkout silently falls back to SMS** — until the Twilio WA sender is approved, customers who tick the box still get SMS.
- **Tracking page rider card shows "awaiting dispatch"** — there's no rider dispatch system yet, so the placeholder is permanent for every order.
- **Tracking page map shows zone center, not real-time rider GPS** — same reason.
- **Sanity Studio at `/studio` is empty** — schemas are ready, content not authored yet. Homepage hero + testimonials use hardcoded fallback copy.
- **No `/account` page** — the User icon in the header is dead.
- **No order lookup by email** — if a customer loses the tracking link, they need to dig the order ID out of the SMS/email.
- **No promo/discount code field at checkout** — Medusa supports it, UI not built.
- **Reviews have no admin moderation UI** — to remove a review you'd need direct DB access right now.
- **FAQ page is hardcoded** — schema ready in Sanity, not migrated.

---

## I. Things to flag

If any of these happen, raise them immediately:

- 🔴 Real charge that didn't capture (paid by customer = $0 in admin) → Stripe configuration issue
- 🔴 SMS or email never arrives and isn't in spam → notification provider issue
- 🔴 Order succeeds on storefront but doesn't appear in admin → cart-complete bug
- 🔴 Add to Cart from a wizard-created product fails → inventory-level fix didn't ship
- 🔴 Any 500 error → check Sentry
- 🟡 LCP feels slow on mobile (>3s) → perf regression
- 🟡 Cart count doesn't update after Add to Cart → SWR cache issue
- 🟡 Variant picker click doesn't toggle border → CSS regression
