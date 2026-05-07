import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { MEDUSA_BACKEND_URL } from "@/lib/medusa/client";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "";

interface SubmitBody {
  rating?: number;
  title?: string;
  body?: string;
  customer_name?: string;
  customer_email?: string;
}

// Storefront proxy that forwards review submissions to the Medusa backend.
// Keeps the publishable key server-side and lets us revalidate the PDP cache
// on success so the new review appears immediately.
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as SubmitBody;

  try {
    const res = await fetch(
      `${MEDUSA_BACKEND_URL}/store/products/${encodeURIComponent(slug)}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {}),
        },
        body: JSON.stringify(body),
      }
    );
    const rawBody = await res.text();
    if (!res.ok) {
      // Surface the raw backend body so diagnostic info reaches the client
      // even when the backend returns non-JSON 500s. Tighten this back to
      // `error: data?.error ?? HTTP ${res.status}` once review submissions
      // are stable in production.
      console.error("[api/products/reviews] backend %d: %s", res.status, rawBody.slice(0, 500));
      let parsed: { error?: string } | null = null;
      try { parsed = JSON.parse(rawBody) as { error?: string }; } catch { /* not JSON */ }
      return NextResponse.json(
        {
          ok: false,
          error: parsed?.error ?? `HTTP ${res.status}`,
          backend_body: rawBody.slice(0, 1000),
        },
        { status: res.status }
      );
    }
    revalidatePath(`/products/${slug}`);
    const data = JSON.parse(rawBody) as { review?: unknown };
    return NextResponse.json({ ok: true, review: data.review });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[api/products/reviews] error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
