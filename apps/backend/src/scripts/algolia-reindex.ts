import { ContainerRegistrationKeys, ExecArgs } from "@medusajs/framework/types";
import { algoliaEnabled, configureIndex, upsertProducts, AlgoliaProductDoc } from "../lib/algolia";

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
    calculated_price?: { calculated_amount?: number; currency_code?: string } | null;
  }[];
}

function toDoc(p: ProductGraphResult): AlgoliaProductDoc {
  const variant = p.variants?.[0];
  const inStock = (p.variants ?? []).some((v) => {
    if (v.manage_inventory === false) return true;
    return (v.inventory_quantity ?? 0) > 0;
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
    price: variant?.calculated_price?.calculated_amount ?? null,
    currency: variant?.calculated_price?.currency_code ?? "jmd",
    in_stock: inStock,
  };
}

// Reindex all published products into Algolia. Run via:
//   pnpm exec medusa exec ./src/scripts/algolia-reindex.ts
// Idempotent — uses Algolia's batch updateObject so existing docs are merged.
export default async function reindex({ container }: ExecArgs) {
  const logger = container.resolve("logger");
  if (!algoliaEnabled) {
    logger.warn("[algolia-reindex] ALGOLIA_APP_ID / ALGOLIA_WRITE_API_KEY not set — skipping");
    return;
  }

  logger.info("[algolia-reindex] configuring index settings");
  await configureIndex();

  const query = container.resolve(ContainerRegistrationKeys.QUERY) as unknown as {
    graph(args: {
      entity: string;
      fields: string[];
      filters?: Record<string, unknown>;
      pagination?: { take?: number; skip?: number };
    }): Promise<{ data: ProductGraphResult[] }>;
  };

  const { data: products } = await query.graph({
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
      "variants.calculated_price.*",
    ],
    filters: { status: "published" },
    pagination: { take: 1000 },
  });

  logger.info(`[algolia-reindex] found ${products.length} published products`);
  if (products.length === 0) return;

  const docs = products.map(toDoc);
  // Algolia batch endpoint accepts up to 1000 ops per call — split if needed.
  const CHUNK = 500;
  for (let i = 0; i < docs.length; i += CHUNK) {
    const slice = docs.slice(i, i + CHUNK);
    await upsertProducts(slice);
    logger.info(`[algolia-reindex] pushed ${slice.length} (${i + slice.length}/${docs.length})`);
  }
  logger.info("[algolia-reindex] done");
}
