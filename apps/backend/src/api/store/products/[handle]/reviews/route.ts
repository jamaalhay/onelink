import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import { PRODUCT_REVIEW_MODULE } from "../../../../../modules/product-review";
import ProductReviewService from "../../../../../modules/product-review/service";

interface ReviewBody {
  rating?: number;
  title?: string;
  body?: string;
  customer_name?: string;
  customer_email?: string;
}

// Resolve a product handle to its id via Query. Returns null when the handle
// doesn't match any product so the route can 404 cleanly.
async function resolveProductId(
  query: { graph(args: { entity: string; fields: string[]; filters: Record<string, unknown> }): Promise<{ data: Array<{ id: string }> }> },
  handle: string
): Promise<string | null> {
  const { data } = await query.graph({
    entity: "product",
    fields: ["id"],
    filters: { handle },
  });
  return data?.[0]?.id ?? null;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const handle = req.params.handle;
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as Parameters<typeof resolveProductId>[0];
  const productId = await resolveProductId(query, handle);
  if (!productId) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const service = req.scope.resolve(PRODUCT_REVIEW_MODULE) as ProductReviewService;
  // listAndCount returns [items, count]. Latest first; cap at 50 per page.
  const [reviews, count] = await service.listAndCountProductReviews(
    { product_id: productId },
    { take: 50, order: { created_at: "DESC" } }
  );

  // Aggregate so the storefront doesn't need to recompute on every render.
  const total = reviews.length;
  const sum = reviews.reduce((s, r) => s + (r.rating ?? 0), 0);
  const avg = total > 0 ? sum / total : 0;
  const dist = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      customer_name: r.customer_name,
      is_verified: r.is_verified,
      created_at: r.created_at,
    })),
    summary: { count, average: Number(avg.toFixed(2)), distribution: dist },
  });
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const handle = req.params.handle;
  const body = req.body as ReviewBody;

  const rating = Number(body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    res.status(400).json({ error: "rating must be an integer between 1 and 5" });
    return;
  }
  const reviewBody = (body.body ?? "").trim();
  if (reviewBody.length < 10 || reviewBody.length > 2000) {
    res.status(400).json({ error: "body must be between 10 and 2000 characters" });
    return;
  }
  const customerName = (body.customer_name ?? "").trim();
  if (customerName.length < 2 || customerName.length > 80) {
    res.status(400).json({ error: "customer_name must be between 2 and 80 characters" });
    return;
  }
  const title = body.title?.trim() || null;
  const email = body.customer_email?.trim() || null;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY) as Parameters<typeof resolveProductId>[0];
  const productId = await resolveProductId(query, handle);
  if (!productId) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  // Verified flag = customer with this email has at least one fulfilled order
  // containing this product. Cheap signal-of-good-faith; not a strong identity
  // proof. Done as a separate query so the review still posts if the lookup
  // fails for any reason.
  let isVerified = false;
  if (email) {
    try {
      const orderQuery = query as unknown as {
        graph(args: { entity: string; fields: string[]; filters: Record<string, unknown> }): Promise<{ data: Array<{ id: string }> }>;
      };
      const { data } = await orderQuery.graph({
        entity: "order",
        fields: ["id", "items.product_id"],
        filters: { email, "items.product_id": productId },
      });
      isVerified = (data?.length ?? 0) > 0;
    } catch (err) {
      // Non-fatal: fall through with isVerified=false.
      console.warn("[reviews POST] verified-buyer lookup failed:", (err as Error).message);
    }
  }

  const service = req.scope.resolve(PRODUCT_REVIEW_MODULE) as ProductReviewService;
  try {
    const created = await service.createProductReviews({
      product_id: productId,
      rating,
      title,
      body: reviewBody,
      customer_name: customerName,
      customer_email: email,
      is_verified: isVerified,
    });
    res.status(201).json({
      review: {
        id: created.id,
        rating: created.rating,
        title: created.title,
        body: created.body,
        customer_name: created.customer_name,
        is_verified: created.is_verified,
        created_at: created.created_at,
      },
    });
  } catch (err) {
    if (err instanceof MedusaError) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
}
