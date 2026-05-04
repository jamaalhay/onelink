"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

// Embedded Sanity Studio at /studio. Renders only when
// NEXT_PUBLIC_SANITY_PROJECT_ID is set (the config will throw otherwise).
export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
