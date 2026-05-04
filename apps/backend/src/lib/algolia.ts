// Thin wrapper around Algolia's REST API. We don't pull in the algoliasearch
// SDK on the backend — fetch is enough and keeps the bundle small. All calls
// go to the write endpoint with the admin API key.
//
// Index name + creds come from env so dev/staging/prod can point at different
// indexes.

const APP_ID = process.env.ALGOLIA_APP_ID;
const WRITE_KEY = process.env.ALGOLIA_WRITE_API_KEY;
const INDEX = process.env.ALGOLIA_INDEX_NAME ?? "onelink_products";

export const algoliaEnabled = Boolean(APP_ID && WRITE_KEY);

// Algolia routes writes to {appId}.algolia.net + three redundant hosts on
// algolianet.com. Some networks (and Railway/Alpine resolvers) can't resolve
// `algolia.net` reliably, so we always start from algolianet.com and retry
// across the three redundant hosts on transport errors.
const HOSTS = [
  `${APP_ID}-1.algolianet.com`,
  `${APP_ID}-2.algolianet.com`,
  `${APP_ID}-3.algolianet.com`,
];

function headers() {
  return {
    "X-Algolia-Application-Id": APP_ID!,
    "X-Algolia-API-Key": WRITE_KEY!,
    "Content-Type": "application/json",
  } as Record<string, string>;
}

async function fetchAlgolia(
  path: string,
  init: { method: string; body?: string }
): Promise<Response> {
  let lastErr: unknown;
  for (const host of HOSTS) {
    try {
      const res = await fetch(`https://${host}${path}`, {
        method: init.method,
        headers: headers(),
        body: init.body,
      });
      // 4xx/5xx from Algolia is a real response — return it; only retry on transport errors.
      return res;
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export interface AlgoliaProductDoc {
  objectID: string;
  handle: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  category_handles: string[];
  category_names: string[];
  tags: string[];
  price?: number | null;
  currency?: string | null;
  in_stock: boolean;
}

export async function upsertProducts(docs: AlgoliaProductDoc[]): Promise<void> {
  if (!algoliaEnabled || docs.length === 0) return;
  const body = JSON.stringify({
    requests: docs.map((d) => ({ action: "updateObject", body: d })),
  });
  const res = await fetchAlgolia(
    `/1/indexes/${encodeURIComponent(INDEX)}/batch`,
    { method: "POST", body }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Algolia batch upsert failed: ${res.status} ${text.slice(0, 200)}`);
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  if (!algoliaEnabled) return;
  const res = await fetchAlgolia(
    `/1/indexes/${encodeURIComponent(INDEX)}/${encodeURIComponent(productId)}`,
    { method: "DELETE" }
  );
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    throw new Error(`Algolia delete failed: ${res.status} ${text.slice(0, 200)}`);
  }
}

// Configure index settings: which attributes to search, ranking, faceting.
// Idempotent — safe to call on every reindex.
export async function configureIndex(): Promise<void> {
  if (!algoliaEnabled) return;
  const settings = {
    searchableAttributes: [
      "title",
      "category_names,tags",
      "description",
    ],
    attributesForFaceting: ["filterOnly(category_handles)", "filterOnly(in_stock)"],
    customRanking: ["desc(in_stock)"],
    typoTolerance: true,
    minWordSizefor1Typo: 3,
    minWordSizefor2Typos: 7,
    hitsPerPage: 20,
  };
  const res = await fetchAlgolia(
    `/1/indexes/${encodeURIComponent(INDEX)}/settings`,
    { method: "PUT", body: JSON.stringify(settings) }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Algolia settings failed: ${res.status} ${text.slice(0, 200)}`);
  }
}
