import { model } from "@medusajs/framework/utils";

// Onelink customer reviews. One row per submission, soft-deletable, with
// `is_verified` flagged when the submitter's email matches an order that
// contains this product.
export const ProductReview = model.define("product_review", {
  id: model.id().primaryKey(),
  product_id: model.text().index(),
  rating: model.number(),
  title: model.text().nullable(),
  body: model.text(),
  customer_name: model.text(),
  customer_email: model.text().nullable(),
  is_verified: model.boolean().default(false),
});
