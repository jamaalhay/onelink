// Side-effect import: initializes Sentry before Medusa loads modules / HTTP
// so unhandled exceptions in routes, subscribers, and workflows are captured.
// Must be the first import.
import "./instrumentation"

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
      resolve: "./src/modules/product-review",
    },
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
    // Notification module — registers any combination of Twilio SMS + Resend
    // email that is configured via env. If neither is set the module is omitted
    // so dev/staging boots cleanly.
    ...(() => {
      const providers: Array<Record<string, unknown>> = [];
      if (
        process.env.TWILIO_ACCOUNT_SID &&
        process.env.TWILIO_AUTH_TOKEN &&
        process.env.TWILIO_FROM_NUMBER
      ) {
        // Same provider class handles SMS and WhatsApp. WA can use either a
        // direct whatsapp:+ sender or a Messaging Service whose sender pool
        // contains the approved WhatsApp sender. Approved Content Templates are
        // selected per Medusa notification template when configured.
        providers.push({
          resolve: "./src/modules/twilio-sms",
          id: "twilio-sms",
          options: {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
            fromNumber: process.env.TWILIO_FROM_NUMBER,
            whatsappFromNumber: process.env.TWILIO_WHATSAPP_FROM,
            whatsappMessagingServiceSid:
              process.env.TWILIO_WHATSAPP_MESSAGING_SERVICE_SID,
            whatsappContentSid: process.env.TWILIO_WHATSAPP_CONTENT_SID,
            allowWhatsAppFreeform:
              process.env.TWILIO_WHATSAPP_ALLOW_FREEFORM === "true",
            whatsappContentSids: {
              "order-placed":
                process.env.TWILIO_WHATSAPP_ORDER_PLACED_CONTENT_SID ??
                process.env.TWILIO_WHATSAPP_CONTENT_SID,
              "shipment.created":
                process.env.TWILIO_WHATSAPP_ORDER_ON_THE_WAY_CONTENT_SID,
              "delivery.created":
                process.env.TWILIO_WHATSAPP_ORDER_DELIVERED_CONTENT_SID,
            },
            // Channels go inside provider.options.channels (not top-level —
            // counterintuitive but it's how @medusajs/notification's loader
            // reads them).
            channels: ["sms", "whatsapp"],
          },
        });
      }
      if (process.env.RESEND_API_KEY) {
        providers.push({
          resolve: "./src/modules/resend-email",
          id: "resend-email",
          options: {
            apiKey: process.env.RESEND_API_KEY,
            from: process.env.RESEND_FROM ?? "Onelink <onboarding@resend.dev>",
            channels: ["email"],
          },
        });
      }
      return providers.length
        ? [
            {
              resolve: "@medusajs/medusa/notification",
              options: { providers },
            },
          ]
        : [];
    })(),
  ],
})
