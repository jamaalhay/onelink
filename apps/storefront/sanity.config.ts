// Sanity Studio config — embedded at /studio in the storefront.
// Configure these env vars on Vercel + .env.local:
//   NEXT_PUBLIC_SANITY_PROJECT_ID  (e.g. abc123de — from manage.sanity.io)
//   NEXT_PUBLIC_SANITY_DATASET     (default: production)
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "onelink-cms",
  title: "Onelink CMS",
  basePath: "/studio",
  projectId: projectId!,
  dataset,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
