import { defineType, defineField } from "sanity";

// Customer testimonials shown on the homepage and across landing pages.
export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Customer name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "area",
      title: "Area",
      type: "string",
      description: "Kingston neighborhood (e.g. 'New Kingston')",
    }),
    defineField({
      name: "rating",
      title: "Rating (1-5)",
      type: "number",
      validation: (r) => r.required().min(1).max(5).integer(),
    }),
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 3,
      validation: (r) => r.required().max(500),
    }),
    defineField({
      name: "order",
      title: "Display order",
      type: "number",
      description: "Lower numbers show first. Optional.",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
});
