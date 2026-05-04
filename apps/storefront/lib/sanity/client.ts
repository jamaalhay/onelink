import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

// `cmsEnabled` lets callers fall back to hardcoded copy when CMS env vars
// aren't set (so the storefront still renders during local dev / before the
// Sanity project exists).
export const cmsEnabled = Boolean(projectId);

export const sanityClient = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      // Free CDN for read-only queries — fine for our static-ish content.
      useCdn: true,
    })
  : null;
