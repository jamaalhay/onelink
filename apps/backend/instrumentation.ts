// Sentry init for the Medusa backend. This file is imported at the top of
// medusa-config.ts so Sentry is up before Medusa boots HTTP, modules, and
// subscribers — that way unhandled exceptions in any of them get captured.
//
// Medusa v2 doesn't have a Next.js-style instrumentation hook, so we run
// the init as a side effect of the import (not via an exported register()
// function — that pattern silently no-ops here).
import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "production",
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}
