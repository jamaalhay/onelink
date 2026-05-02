import Medusa from "@medusajs/js-sdk";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  // Don't throw at import time — server-rendered routes can crash the whole app.
  // Surface a clear runtime warning instead and let calls fail with helpful errors.
  // eslint-disable-next-line no-console
  console.warn(
    "[medusa] NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY not set — store API calls will fail."
  );
}

export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: PUBLISHABLE_KEY,
});

export const MEDUSA_BACKEND_URL = BACKEND_URL;
