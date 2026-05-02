# Onelink — Design Constitution

> Authoritative design source for Claude Code agents and contributors. Read this
> before generating any UI. Overrides generic taste-skill defaults when they conflict.

## 1. Visual Theme & Atmosphere

Premium local-delivery commerce, Kingston-grounded but not regional-coded.
Editorial minimalism with one surgical electric-blue accent. Every pixel earns its
place. Apple Store calm meets Linear's surgical restraint. Photography-led, not
illustration-led.

**Mood:** confident, premium, fast, discreet. Quiet authority over loud novelty.
Trust signals visible at every step without overwhelming the layout.

**Anti-mood:** smoke-shop template aesthetic, neon-saturated commerce, gradient
soup, "purple SaaS," cluttered marketplace UX.

## 2. Color Palette & Roles

```
--bg:              #FFFFFF      /* primary surface */
--bg-alt:          #FAFAFA      /* page bands, hover surfaces */
--surface:         #F4F4F5      /* card fills when needed */
--bg-dark:         #20242C      /* footer, dark sections, charcoal CTAs */
--surface-dark:    #2A2F38

--text:            #20242C      /* charcoal — body + headings */
--text-muted:      #6B7280
--text-dim:        #9CA3AF

--border:          #E9E9EA      /* soft gray — primary divider */
--border-strong:   #D4D4D8

--accent:          #2F8BD8      /* electric blue, USE SPARINGLY */
--accent-hover:    #267BC2

--success:         #10B981      /* in-stock, order confirmed */
--warning:         #F59E0B      /* low stock */
--danger:          #DC2626      /* out of stock, error */
```

**The Electric-Blue Rule:** the accent appears only on (a) primary CTAs, (b) selected
states, (c) active step in a stepper, (d) the chain-link logo mark. Never as a
background, never as a gradient stop, never on hero illustrations. Saturation < 80%.

**The Charcoal Rule:** charcoal is the primary content color. Never use pure black.
Never use a second neutral (no warm-cool mixing).

## 3. Typography

- **Display + Body:** `Geist` (loaded via `next/font/google`), fallback `Inter Display`,
  `Helvetica Neue`, `system-ui`. Weights 400 / 500 / 600 / 700.
- **Mono:** `Geist Mono`, fallback `SF Mono`, `JetBrains Mono`.

**Inter is BANNED** for primary type per the taste-skill anti-slop rule. Geist is the
identity font.

**Scale (rem):** `0.75 / 0.875 / 1 / 1.125 / 1.25 / 1.5 / 2 / 2.5 / 3 / 3.75 / 4.5`.

**Headlines:** `tracking-tight`, `leading-[1.05]`, weight 600. Never 700+.
**Body:** `text-base text-[var(--text)] leading-relaxed max-w-[65ch]`.
**Eyebrow labels:** `text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]`.

No serif anywhere. No italics for emphasis — bump weight to 600 instead.

## 4. Component Stylings

**Buttons**
- Primary: `--accent` fill, white text, radius `8px`, height `44px` (touch target),
  padding `0 20px`, weight 500. Hover: `--accent-hover` + `-translate-y-[1px]`.
  Active: `scale-[0.98]`. No box-shadow.
- Secondary: white fill, charcoal text, `1px --border`. Hover: `--surface` fill.
- Ghost: text-only, accent on hover.
- Destructive: `--danger` fill, white text. Used only for irreversible actions.

**Cards (use sparingly)**
- White fill, `1px --border`, radius `12px`, padding `24px`. Hover: `--border-strong`.
- **No drop shadows.** Border depth only. Shadows reserved for popovers / dropdowns.
- Product cards: white, no border on grid (`divide-y` row separators acceptable).

**Inputs**
- 1px `--border`, radius `8px`, height `44px`, padding `0 14px`.
- Focus: 2px `--accent` ring with 2px white offset.
- Label always above input, helper text below input, errors inline below.
- Error state: `--danger` border + 1px ring.

**Badges**
- "In Stock": `--success` text on `--success`/10 fill, radius `4px`, `text-xs`.
- "Best Seller", "New": charcoal fill, white text, `text-xs uppercase tracking-wider`.
- Out of stock: `--text-dim` text, no fill.

**Stepper (checkout)**
- Active: `--accent` filled circle with white number.
- Completed: `--accent` filled circle with check icon.
- Pending: `--border-strong` outlined circle with `--text-dim` number.

## 5. Layout Principles

- **Container:** `max-w-[1400px] mx-auto`, gutter `24px` mobile / `40px` desktop.
- **Grid:** CSS Grid for structure. Never flexbox percentage math.
- **Spacing scale:** 4px base unit. `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`.
- **Hero:** split layout (content left, isolated product image right at desktop;
  stacked at mobile). Never centered on `lg:` and up.
- **Density:** moderate. `VISUAL_DENSITY: 5` on the taste-skill dial. Generous
  whitespace around hero and primary CTAs; tighter inside cards and tables.
- **Viewport stability:** use `min-h-[100dvh]`, never `h-screen`, on Hero sections.

## 6. Depth & Elevation

Flat. Border-based depth. Shadow only on:
- Popovers / dropdowns / modals: `0 8px 24px -8px rgba(32, 36, 44, 0.12)`
- Toast notifications: same shadow
- Tinted to charcoal hue, never black

## 7. Iconography

- **Primary set:** `@phosphor-icons/react`, `weight="regular"` default. Use `weight="bold"`
  for primary navigation icons only.
- **Secondary set:** `@radix-ui/react-icons` for in-form / shadcn-default icons.
- **No emojis** anywhere — code, copy, alt text, transactional emails. Replace any
  emoji with a Phosphor or Radix icon.
- Stroke width: standardize `1.5` everywhere except 24px+ icons which use `2`.

## 8. Motion

`MOTION_INTENSITY: 4` on the taste-skill dial. Restrained.

- Page transitions: none (App Router default fade is fine).
- Component mounts: `staggerChildren: 0.05` on grids, `spring` physics.
- Hover lifts: `-translate-y-[1px]` on buttons + cards.
- Active press: `scale-[0.98]`.
- **Banned:** magnetic cursor, parallax, perpetual orbiting, scroll-jacking, any
  full-page-pinned scrollytelling.

Use Framer Motion's `useMotionValue` and `useTransform` for any continuous animation —
never `useState`. Server Components must remain static; isolate motion in
`'use client'` leaf components.

## 9. Onelink-Specific Patterns

**Top Delivery Bar** (persistent, above header)
- Charcoal fill, white text, height `40px`, `text-sm`.
- Pattern: `[location pin icon] Delivering to [Zone] · ETA [15-30 min] · [Change]`
- "Change" is a button that opens a zone picker drawer.
- On scroll, condenses to ETA only; expands again on header re-show.

**Header**
- White fill, `1px border-b --border`, height `72px`, sticky.
- Logo left (use `lockup-color.svg`, height 28px).
- Nav: Shop · Categories · Deals · Track Order · About.
- Right: search-icon, account-icon, cart-icon (with badge for count > 0).
- Mobile: hamburger left, logo center, cart right.

**Trust Strip** (above footer, below page content)
- Horizontal row of 4 cells, each with Phosphor icon + 2-line label.
- Pattern: `100% Authentic · Secure Checkout · Discreet Packaging · Satisfaction Guaranteed`.
- White fill, `1px border-y --border`, py-`32px`.
- Icons in `--accent` blue, labels charcoal.

**Hero (Homepage)**
- Split 50/50 desktop, stacked mobile.
- Left: H1 (text-5xl/6xl, tracking-tight), supporting copy (text-lg text-muted),
  Shop Now CTA (primary), trust badges row.
- Right: isolated product photography on white, no shadow.
- H1 must communicate the offer in 3 seconds.

**Age Gate Modal** (first visit, cookie-stored)
- Backdrop: `rgba(32,36,44,0.6)`, no blur.
- Modal: white, centered, max-w-[420px], radius `16px`, padding `32px`.
- Logo top, headline "Are you 18 or older?", body copy, two buttons (Yes primary, No secondary which redirects to onelink.example/leave).
- Compliance note in `text-xs text-muted`.

**WhatsApp CTA**
- Reuse Phosphor `WhatsappLogo` icon at `weight="fill"`, color `#25D366`.
- "Need help? Chat on WhatsApp" — links to `wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}` with
  prefilled message via `?text=` URL-encoded.
- Placement: footer-band on every page; checkout helper; tracking page.
- Never as a primary CTA — always secondary.

**Order Status Timeline**
- 6 stages: Received → Confirmed → Preparing → Rider Assigned → Out for Delivery → Delivered.
- Active stage: `--accent` filled circle with white check.
- Completed stages: `--accent` filled, lower opacity (`/60`).
- Pending stages: `--border-strong` outlined.
- Horizontal on desktop, vertical on mobile.

**Product Card**
- White fill, no border on grid cell. Image area `aspect-[4/5]` with `--bg-alt` fill.
- Title: `text-sm font-medium`, single line, truncate.
- Price: `text-base font-semibold`. Variant label: `text-xs text-muted`.
- Add to Cart: full-width primary button at bottom of card.
- Out of stock: image at `opacity-60`, button disabled, "Out of Stock" badge top-left.

## 10. Dial Configuration (taste-skill)

```yaml
DESIGN_VARIANCE: 5      # Down from default 8 — mockups are conventional ecommerce
MOTION_INTENSITY: 4     # Down from default 6 — restrained, no magnetic cursors
VISUAL_DENSITY: 5       # Default 4 + 1 — slightly denser than gallery, lighter than dashboard
```

If a taste-skill variant runs and these values aren't read, override the variant
defaults explicitly via system prompt.

## 11. Do's and Don'ts

**Do**
- Use electric blue as punctuation, not paragraph.
- Keep product photography isolated on white, no shadows.
- Surface delivery zone + ETA from the first paint.
- Make WhatsApp visible but secondary.
- Use Geist for everything — body, headings, UI labels, mono.

**Don't**
- Use Inter (banned by taste-skill anti-slop policy).
- Use any emoji anywhere.
- Use rounded pills for buttons — radius cap is 12px (16px for cards / modals).
- Add drop shadows to cards or buttons.
- Introduce a second accent color.
- Apply gradients anywhere — solids only.
- Use serif fonts.
- Center hero content on `lg:` breakpoints — split layout only.

## 12. Responsive Behavior

- Mobile-first. Mobile is not a reduced desktop — it's the canonical experience.
- **Sticky** mobile patterns: top delivery bar, bottom Add-to-Cart on PDP, bottom
  primary CTA in checkout.
- Header collapses to: hamburger / logo / cart at `md:` and below.
- Filters slide-up drawer on mobile shop page (not sidebar).
- Tables stack to key-value pairs at `< sm:`.
- Headlines step down one size per breakpoint (e.g., `text-6xl lg:text-5xl md:text-4xl`).

## 13. Accessibility

- Practical WCAG AA on primary flows.
- Color is never the sole differentiator (icons + text on status, not color alone).
- Focus rings always visible (2px `--accent` with 2px offset).
- Touch targets minimum 44×44px.
- Form labels always visible (no placeholder-only labels).
- All actions reachable via keyboard. Skip-to-content link in header.

## 14. Agent Prompt Guide

When generating UI, bias toward:
- Geist typography, no Inter.
- Singular electric blue accent on primary actions.
- 1px borders over shadows.
- 8–12px button radius / 12–16px card radius / 16px modal radius cap.
- CSS Grid layout, never flex math.
- Phosphor icons, stroke 1.5.
- Server Components for static content, `'use client'` leaf components for motion.
- Restrained motion (spring physics, no continuous animations).
- Trust strip + WhatsApp CTA + delivery bar always present unless explicitly excluded.

Reject:
- Inter font, drop shadows on cards, gradient backgrounds, emoji, multi-color
  palettes, centered hero on desktop, shadow on product imagery, rounded pill
  buttons, magnetic cursors, parallax, h-screen on hero, percentage flexbox math.

## 15. Reference Mockups

The authoritative visual references are the 9 ecommerce mockups + 7 admin mockups
extracted from the spec docs. Source images preserved at:

- `/tmp/onelink-spec/img-ecom/word/media/` — homepage, shop, PDP, cart, checkout, tracking, mobile responsive
- `/tmp/onelink-spec/img-admin/word/media/` — admin product list, 3-step wizard, success state

When in doubt about layout, hierarchy, or component composition, match the mockups
rather than improvise. Use the visual validation loop (`/ralph-loop` + Playwright)
to diff implementations against these references.
