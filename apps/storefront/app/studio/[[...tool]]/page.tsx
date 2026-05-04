"use client";

import dynamic from "next/dynamic";

// NextStudio touches `window` at module init (Sanity's auth store reads
// location for OAuth hash handling). Skip SSR entirely so it only runs in
// the browser — otherwise Sentry catches a `window is not defined` on every
// hit to /studio.
const NextStudio = dynamic(
  () => import("next-sanity/studio").then((m) => m.NextStudio),
  { ssr: false }
);

import config from "../../../sanity.config";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
