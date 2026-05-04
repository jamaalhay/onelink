import { defineType, defineField } from "sanity";

// Homepage hero — single document (singleton). The storefront pulls one
// `hero` doc and falls back to hardcoded copy if none exists.
export const hero = defineType({
  name: "hero",
  title: "Homepage Hero",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label above the headline (e.g. 'Premium · Kingston')",
      validation: (r) => r.max(60),
    }),
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "Main hero headline. Use `*word*` to mark accent text.",
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: "subline",
      title: "Subline",
      type: "text",
      rows: 2,
      validation: (r) => r.max(280),
    }),
    defineField({
      name: "primaryCta",
      title: "Primary CTA",
      type: "object",
      fields: [
        defineField({ name: "label", type: "string" }),
        defineField({ name: "href", type: "string" }),
      ],
    }),
    defineField({
      name: "secondaryCta",
      title: "Secondary CTA",
      type: "object",
      fields: [
        defineField({ name: "label", type: "string" }),
        defineField({ name: "href", type: "string" }),
      ],
    }),
    defineField({
      name: "image",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
});
