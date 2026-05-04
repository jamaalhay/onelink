import "server-only";
import { MEDUSA_BACKEND_URL } from "./client";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

export interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  customer_name: string;
  is_verified: boolean;
  created_at: string;
}

export interface ReviewSummaryData {
  count: number;
  average: number;
  distribution: { stars: number; count: number }[];
}

export interface ReviewsPayload {
  reviews: ReviewItem[];
  summary: ReviewSummaryData;
}

const EMPTY: ReviewsPayload = {
  reviews: [],
  summary: {
    count: 0,
    average: 0,
    distribution: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0 })),
  },
};

// Server-only fetcher for reviews. Returns the empty shape on any failure so
// PDP rendering doesn't break.
export async function fetchReviews(handle: string): Promise<ReviewsPayload> {
  try {
    const url = `${MEDUSA_BACKEND_URL}/store/products/${encodeURIComponent(handle)}/reviews`;
    const res = await fetch(url, {
      headers: PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {},
      // Reviews are user-generated; cache lightly so a new submission appears
      // within a minute, without hammering the backend on every PDP view.
      next: { revalidate: 60 },
    });
    if (!res.ok) return EMPTY;
    const data = (await res.json()) as ReviewsPayload;
    return data?.reviews ? data : EMPTY;
  } catch (err) {
    console.error("[reviews.fetch] failed:", err);
    return EMPTY;
  }
}
