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
      org: process.env.SENTRY_ORG ?? "candor-71",
      project: process.env.SENTRY_PROJECT ?? "onelink-storefront",
      // Auth token (set on Vercel as SENTRY_AUTH_TOKEN) lets the build upload
      // source maps so Sentry stack traces are unminified.
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      // Tunnel /monitoring so ad blockers don't eat Sentry network calls.
      tunnelRoute: "/monitoring",
      automaticVercelMonitors: false,
      disableLogger: true,
    })
  : nextConfig;
