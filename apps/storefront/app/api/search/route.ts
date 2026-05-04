import { NextResponse } from "next/server";
import { sdk } from "@/lib/medusa/client";

const REGION_FALLBACK_TIMEOUT_MS = 5000;

let cachedRegionId: string | null = null;
async function getRegionId(): Promise<string | undefined> {
  if (cachedRegionId) return cachedRegionId;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REGION_FALLBACK_TIMEOUT_MS);
    const { regions } = await sdk.store.region.list();
    clearTimeout(timer);
    const jamaica = regions?.find((r) => r.name === "Jamaica");
    if (jamaica) cachedRegionId = jamaica.id;
    return cachedRegionId ?? undefined;
  } catch {
    return undefined;
  }
}

interface MinimalProduct {
  id: string;
  handle: string;
  title: string;
  thumbnail: string | null;
  price: number | null;
  category?: { handle: string; name: string } | null;
}

// Lightweight search endpoint for the typeahead overlay. Hits Medusa's
// /store/products?q=… and returns a slim shape (8 results, just what the
// dropdown needs). Cached briefly to be friendly during fast typing.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ results: [] }, {
      headers: { "cache-control": "public, max-age=15, s-maxage=15" },
    });
  }

  try {
    const region_id = await getRegionId();
    const params: Record<string, unknown> = {
      q,
      limit: 8,
      fields:
        "id,handle,title,thumbnail,categories.handle,categories.name,variants.calculated_price",
    };
    if (region_id) params.region_id = region_id;

    const { products } = await sdk.store.product.list(params);
    const results: MinimalProduct[] = (products ?? []).map((p) => {
      const cp = p.variants?.[0]?.calculated_price as { calculated_amount?: number } | undefined;
      const cat = (p.categories ?? [])[0];
      return {
        id: p.id,
        handle: p.handle ?? "",
        title: p.title ?? "",
        thumbnail: p.thumbnail ?? null,
        price: typeof cp?.calculated_amount === "number" ? cp.calculated_amount : null,
        category: cat ? { handle: cat.handle ?? "", name: cat.name ?? "" } : null,
      };
    });
    return NextResponse.json(
      { results },
      { headers: { "cache-control": "public, max-age=15, s-maxage=15" } }
    );
  } catch (err) {
    console.error("[api/search]", err);
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 });
  }
}
