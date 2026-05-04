import { defineType, defineField } from "sanity";

// FAQ entries. Grouped under sections via the `category` field so the FAQ
// page can render them in tabs or collapsible groups.
export const faq = defineType({
  name: "faq",
  title: "FAQ entry",
  type: "document",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (r) => r.required().max(200),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "array",
      of: [{ type: "block" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Ordering", value: "ordering" },
          { title: "Delivery", value: "delivery" },
          { title: "Payment", value: "payment" },
          { title: "Returns", value: "returns" },
          { title: "Account", value: "account" },
          { title: "General", value: "general" },
        ],
      },
      initialValue: "general",
    }),
    defineField({
      name: "order",
      title: "Display order within category",
      type: "number",
    }),
  ],
  orderings: [
    {
      title: "Category, then order",
      name: "categoryOrder",
      by: [
        { field: "category", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
});
