/**
 * Server-side Medusa data fetchers. Use only from Server Components, route
 * handlers, or server actions — never directly from client components.
 *
 * Returns shapes adapted to the Onelink UI prop types so existing components
 * (ProductCard, CategoryCard, etc.) work without modification.
 */
import "server-only";
import { sdk } from "./client";
import { adaptCategory, adaptProduct } from "./adapters";
import type { Category, Product } from "@/lib/types";

const PRODUCT_FIELDS = [
  "id",
  "handle",
  "title",
  "description",
  "thumbnail",
  "*images",
  "status",
  "tags.value",
  "categories.id",
  "categories.handle",
  "categories.name",
  "*options",
  "*variants",
  "variants.calculated_price",
  "variants.inventory_quantity",
  "variants.manage_inventory",
].join(",");

let _cachedRegionId: string | null = null;

/**
 * Single Jamaica region ID, memoized — but ONLY successful results.
 * A failure (Medusa down, etc.) is not cached, so the next request retries.
 */
async function getJamaicaRegionId(): Promise<string | null> {
  if (_cachedRegionId) return _cachedRegionId;
  try {
    const { regions } = await sdk.store.region.list();
    const jm = regions.find((r) => r.currency_code === "jmd" || r.name === "Jamaica");
    const id = jm?.id ?? regions[0]?.id ?? null;
    if (id) _cachedRegionId = id;
    return id;
  } catch (err) {
    console.error("[medusa.getJamaicaRegionId] failed (will retry):", err);
    return null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const { product_categories } = await sdk.store.category.list({
      fields: "id,handle,name,description",
      limit: 100,
    });
    return product_categories
      .map((c) => adaptCategory(c))
      .filter((c): c is Category => c !== null);
  } catch (err) {
    console.error("[medusa.fetchCategories]", err);
    return [];
  }
}

export async function fetchProducts(opts?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const regionId = await getJamaicaRegionId();
    const params: Record<string, unknown> = {
      limit: opts?.limit ?? 100,
      offset: opts?.offset ?? 0,
      fields: PRODUCT_FIELDS,
    };
    if (regionId) params.region_id = regionId;
    if (opts?.category) {
      const catId = await categoryIdByHandle(opts.category);
      // If category lookup fails for a known category slug, return empty rather
      // than dropping the filter and showing the entire catalog.
      if (!catId) return { products: [], total: 0 };
      params.category_id = catId;
    }
    const { products, count } = await sdk.store.product.list(params);
    return { products: products.map((p) => adaptProduct(p)), total: count ?? products.length };
  } catch (err) {
    console.error("[medusa.fetchProducts]", err);
    return { products: [], total: 0 };
  }
}

export async function fetchProductByHandle(handle: string): Promise<Product | null> {
  try {
    const regionId = await getJamaicaRegionId();
    const params: Record<string, unknown> = {
      handle,
      fields: PRODUCT_FIELDS,
      limit: 1,
    };
    if (regionId) params.region_id = regionId;
    const { products } = await sdk.store.product.list(params);
    return products[0] ? adaptProduct(products[0]) : null;
  } catch (err) {
    console.error("[medusa.fetchProductByHandle]", err);
    return null;
  }
}

export async function fetchRelatedProducts(
  handle: string,
  limit = 4
): Promise<Product[]> {
  const current = await fetchProductByHandle(handle);
  if (!current) return [];
  const { products } = await fetchProducts({ category: current.category, limit: limit + 1 });
  return products.filter((p) => p.slug !== handle).slice(0, limit);
}

export async function fetchFeaturedProducts(limit = 8): Promise<Product[]> {
  const { products } = await fetchProducts({ limit });
  // Sort: in-stock first, then alphabetical for stable ordering
  return products
    .sort((a, b) => Number(b.inStock) - Number(a.inStock) || a.title.localeCompare(b.title))
    .slice(0, limit);
}

async function categoryIdByHandle(handle: string): Promise<string | undefined> {
  try {
    const { product_categories } = await sdk.store.category.list({
      handle,
      fields: "id,handle",
      limit: 1,
    });
    return product_categories[0]?.id;
  } catch {
    return undefined;
  }
}

export async function fetchCategoryByHandle(handle: string): Promise<Category | null> {
  try {
    const { product_categories } = await sdk.store.category.list({
      handle,
      fields: "id,handle,name,description",
      limit: 1,
    });
    return product_categories[0] ? adaptCategory(product_categories[0]) : null;
  } catch (err) {
    console.error("[medusa.fetchCategoryByHandle]", err);
    return null;
  }
}

export async function getRegionId(): Promise<string | null> {
  return getJamaicaRegionId();
}
