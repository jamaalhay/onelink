"use client";

import { liteClient as algoliasearch } from "algoliasearch/lite";
import type { SearchClient } from "instantsearch.js";

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

export const ALGOLIA_INDEX =
  process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME ?? "onelink_products";

export const algoliaEnabled = Boolean(APP_ID && SEARCH_KEY);

let client: SearchClient | null = null;

export function getAlgoliaClient(): SearchClient | null {
  if (!algoliaEnabled) return null;
  if (!client) {
    // liteClient returns a search-only client (smaller bundle than full SDK)
    // and matches the InstantSearch SearchClient interface.
    client = algoliasearch(APP_ID!, SEARCH_KEY!) as unknown as SearchClient;
  }
  return client;
}
