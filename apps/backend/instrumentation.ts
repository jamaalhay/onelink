import * as Sentry from "@sentry/node";

// Medusa calls register() once at boot before any modules load. Sentry's
// docs recommend initializing as early as possible so it can patch HTTP,
// fs, and other instrumentations.
export function register() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "production",
    // Sample 10% of transactions for performance — adjust if you outgrow it.
    tracesSampleRate: 0.1,
    // Don't ship PII automatically — order data has phone, email, address.
    sendDefaultPii: false,
  });
}
