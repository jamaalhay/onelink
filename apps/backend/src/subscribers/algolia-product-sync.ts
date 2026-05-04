import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { algoliaEnabled, upsertProducts, deleteProduct, AlgoliaProductDoc } from "../lib/algolia";

interface ProductGraphResult {
  id: string;
  handle: string | null;
  title: string;
  description: string | null;
  thumbnail: string | null;
  status: string | null;
  tags: { value: string }[];
  categories: { handle: string | null; name: string | null }[];
  variants: {
    inventory_quantity: number | null;
    manage_inventory: boolean | null;
    prices: { amount: number | null; currency_code: string | null }[];
  }[];
}

function toDoc(p: ProductGraphResult): AlgoliaProductDoc {
  let price: number | null = null;
  for (const v of p.variants ?? []) {
    for (const pr of v.prices ?? []) {
      if (pr.currency_code === "jmd" && typeof pr.amount === "number") {
        if (price === null || pr.amount < price) price = pr.amount;
      }
    }
  }
  // See note in algolia-reindex.ts — query.graph doesn't always resolve
  // variant inventory_quantity. Default optimistic; live PDP shows truth.
  const inStock = (p.variants ?? []).every((v) => {
    if (v.manage_inventory === false) return true;
    if (typeof v.inventory_quantity === "number") return v.inventory_quantity > 0;
    return true;
  });
  return {
    objectID: p.id,
    handle: p.handle ?? "",
    title: p.title,
    description: p.description,
    thumbnail: p.thumbnail,
    category_handles: (p.categories ?? []).map((c) => c.handle ?? "").filter(Boolean),
    category_names: (p.categories ?? []).map((c) => c.name ?? "").filter(Boolean),
    tags: (p.tags ?? []).map((t) => t.value).filter(Boolean),
    price,
    currency: "jmd",
    in_stock: inStock,
  };
}

// Sync a single product to Algolia whenever it's created or updated. Deleted
// products are removed from the index. Failures are logged but don't break
// Medusa's workflow — search is non-critical.
export default async function algoliaProductSync({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!algoliaEnabled) return;

  const productId = event.data.id;
  const eventName = event.name;
  const logger = container.resolve("logger");

  if (eventName === "product.deleted") {
    try {
      await deleteProduct(productId);
      logger.info(`[algolia] removed ${productId}`);
    } catch (err) {
      logger.error(`[algolia] delete failed for ${productId}: ${(err as Error).message}`);
    }
    return;
  }

  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY) as unknown as {
      graph(args: {
        entity: string;
        fields: string[];
        filters: Record<string, unknown>;
      }): Promise<{ data: ProductGraphResult[] }>;
    };
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "handle",
        "title",
        "description",
        "thumbnail",
        "status",
        "tags.value",
        "categories.handle",
        "categories.name",
        "variants.inventory_quantity",
        "variants.manage_inventory",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      filters: { id: productId },
    });
    const product = data[0];
    if (!product) {
      logger.warn(`[algolia] product ${productId} not found — skipping sync`);
      return;
    }
    if (product.status && product.status !== "published") {
      // Hide drafts/archived from search by treating them as deletes.
      await deleteProduct(productId);
      logger.info(`[algolia] hid non-published ${productId} (${product.status})`);
      return;
    }
    await upsertProducts([toDoc(product)]);
    logger.info(`[algolia] synced ${productId} (${product.handle})`);
  } catch (err) {
    logger.error(`[algolia] sync failed for ${productId}: ${(err as Error).message}`);
  }
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
};
