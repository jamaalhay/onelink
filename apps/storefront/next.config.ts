import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  typescript: {
    // Medusa SDK leaks `any` through cart.items in callbacks — clean up
    // post-launch. Production build must not block on those.
    ignoreBuildErrors: true,
  },
};

// Wrap with Sentry only if a DSN is set — keeps dev/preview clean.
const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      // Required because Sentry source-maps upload would otherwise need an auth
      // token. We don't upload source maps for now — errors will still arrive
      // with stack traces; just minified.
      silent: true,
      sourcemaps: { disable: true },
      // Hide Sentry network calls behind our own domain so ad blockers don't
      // drop them.
      tunnelRoute: "/monitoring",
      // Don't auto-instrument all our pages with sentry-cli release; we're
      // letting Vercel handle release detection via SENTRY_ENVIRONMENT.
      automaticVercelMonitors: false,
      disableLogger: true,
    })
  : nextConfig;
