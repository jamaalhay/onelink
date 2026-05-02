import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Conditional Stripe registration — only includes the provider when an API key
// is set, so dev environments without Stripe credentials still boot cleanly.
const stripeProviders = process.env.STRIPE_API_KEY
  ? [
      {
        resolve: "@medusajs/medusa/payment-stripe",
        id: "stripe",
        options: {
          apiKey: process.env.STRIPE_API_KEY,
          webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
          // Capture payments automatically when the customer authorizes.
          // For most JMD card transactions on Stripe, capture-on-auth is what
          // we want; the rider can't refuse the card after the fact.
          capture: true,
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Supabase free tier caps direct connections; default Medusa/Knex pool
    // (10) plus a brief overlap during deploys exhausts the slots and Pg
    // refuses with "remaining connection slots are reserved for roles with
    // SUPERUSER attribute". 4 is enough for a single-replica hobby instance.
    databaseDriverOptions: {
      pool: { min: 0, max: 4 },
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  // Admin UI is enabled in prod for ops (orders, fulfillment, refunds).
  admin: {
    disable: false,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/cod-payment",
            id: "cod",
          },
          ...stripeProviders,
        ],
      },
    },
    // Notification module — Twilio SMS provider handles the "sms" channel.
    // Only registers when Twilio creds are present so dev/staging boot clean.
    ...(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER
      ? [
          {
            resolve: "@medusajs/medusa/notification",
            options: {
              providers: [
                {
                  resolve: "./src/modules/twilio-sms",
                  id: "twilio-sms",
                  options: {
                    accountSid: process.env.TWILIO_ACCOUNT_SID,
                    authToken: process.env.TWILIO_AUTH_TOKEN,
                    fromNumber: process.env.TWILIO_FROM_NUMBER,
                    // Notification module reads channels off provider.options.channels
                    // (not the top-level provider.channels — counterintuitive but
                    // it's how @medusajs/notification's loader is wired).
                    channels: ["sms"],
                  },
                },
              ],
            },
          },
        ]
      : []),
  ],
})
