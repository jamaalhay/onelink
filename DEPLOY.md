# Deploying Onelink

Two services: **storefront** (Next.js) → Vercel, **backend** (Medusa) → Railway.
Both share one Supabase Postgres database (project `onelink`, ref `fckxnuhubqwctfbahtjk`).

---

## Prerequisites — interactive steps you must run

Three things only you can do:

1. **Vercel login** (browser auth)
   ```bash
   vercel login
   ```

2. **Railway login** (browser auth)
   ```bash
   railway login
   ```

3. **Stripe account + test API keys**
   - Sign in at https://dashboard.stripe.com
   - Settings → Developers → API keys
   - Copy the **Secret key** (starts `sk_test_...`) and **Publishable key** (starts `pk_test_...`)
   - Settings → Webhooks → "+ Add endpoint" — leave URL blank for now (we'll fill in after backend deploy), select events `payment_intent.succeeded`, `payment_intent.payment_failed`. Copy the **Signing secret** (starts `whsec_...`)

Hand me the three Stripe keys and I'll wire them into Railway's env in the next step.

---

## Backend → Railway

```bash
cd ~/source/repos/onelink
railway init                        # creates project, links current dir
railway up                          # builds via Dockerfile, deploys
railway variables set \
  DATABASE_URL='postgresql://postgres:<DB_PW>@db.fckxnuhubqwctfbahtjk.supabase.co:5432/postgres' \
  STORE_CORS='https://<your-vercel-domain>.vercel.app,http://localhost:3000' \
  ADMIN_CORS='https://<your-railway-domain>.up.railway.app' \
  AUTH_CORS='https://<your-railway-domain>.up.railway.app,https://<your-vercel-domain>.vercel.app' \
  JWT_SECRET="$(openssl rand -base64 32)" \
  COOKIE_SECRET="$(openssl rand -base64 32)" \
  STRIPE_API_KEY='sk_test_...' \
  STRIPE_WEBHOOK_SECRET='whsec_...' \
  NODE_ENV=production
```

After deploy, copy the Railway URL (e.g. `https://onelink-backend-production.up.railway.app`).

Stripe webhook endpoint = `<railway-url>/hooks/payment/stripe_stripe`. Update the Stripe dashboard endpoint URL to that, save, copy the new signing secret if it changed.

---

## Storefront → Vercel

```bash
cd ~/source/repos/onelink/apps/storefront
vercel link
vercel env add NEXT_PUBLIC_MEDUSA_BACKEND_URL production
# → paste the Railway URL from above
vercel env add NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY production
# → paste pk_f81754f6dec7ffd80dc95b067a3695058f36f3adec575118d6cf2a9000752abe (or generate a new one in admin)
vercel env add NEXT_PUBLIC_WHATSAPP_NUMBER production
# → paste +1876XXXXXXX (real number when ready, placeholder for now)
vercel env add NEXT_PUBLIC_STRIPE_ENABLED production
# → "true"
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# → paste pk_test_... from Stripe dashboard
vercel --prod
```

Vercel will print a URL like `onelink-xyz.vercel.app`. Copy it.

---

## Loop back: update Railway CORS

```bash
railway variables set \
  STORE_CORS='https://<final-vercel-domain>.vercel.app,http://localhost:3000' \
  AUTH_CORS='https://<railway-domain>.up.railway.app,https://<final-vercel-domain>.vercel.app'
```

---

## Smoke test

```bash
# Backend health
curl https://<railway-domain>/health
# Storefront home
curl -sI https://<vercel-domain>/ | head -3
# Place an order via the storefront UI — same e2e but with prod URLs
BASE_URL=https://<vercel-domain> node apps/storefront/e2e-checkout.mjs
```

---

## Rollbacks

- Vercel: dashboard → Deployments → "Promote to Production" on a previous build
- Railway: dashboard → Deployments → "Redeploy" on a previous build
- Database: take a manual snapshot in Supabase before any seed re-run
