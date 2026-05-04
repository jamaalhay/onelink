"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Configure,
  useInstantSearch,
} from "react-instantsearch";
import { getAlgoliaClient, ALGOLIA_INDEX, algoliaEnabled } from "@/lib/algolia";
import { formatJmd } from "@/lib/format";

interface AlgoliaHit {
  objectID: string;
  handle: string;
  title: string;
  thumbnail?: string | null;
  price?: number | null;
  category_names?: string[];
  in_stock?: boolean;
}

// Search trigger button + InstantSearch-powered overlay. Trigger is rendered
// inline; the overlay portals to the document body via fixed positioning.
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K opens, Esc closes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while open + auto-focus the input.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const client = getAlgoliaClient();

  // If Algolia isn't configured, fall back to a plain link to /shop. Keeps
  // dev / preview environments running without the keys.
  if (!algoliaEnabled || !client) {
    return (
      <Link
        href="/shop"
        className="p-2.5 hover:bg-[var(--color-surface)] rounded-md transition-colors"
        aria-label="Search"
      >
        <MagnifyingGlass size={20} />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-2.5 hover:bg-[var(--color-surface)] rounded-md transition-colors"
        aria-label="Search"
      >
        <MagnifyingGlass size={20} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-[10vh] w-full max-w-xl bg-[var(--color-bg)] rounded-[var(--radius-card)] shadow-xl border border-[var(--color-border)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <InstantSearch
              searchClient={client}
              indexName={ALGOLIA_INDEX}
              future={{ preserveSharedStateOnUnmount: true }}
            >
              <Configure hitsPerPage={6} />
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
                <MagnifyingGlass size={18} className="text-[var(--color-text-muted)] shrink-0" />
                <SearchBox
                  classNames={{
                    root: "flex-1",
                    form: "flex",
                    input:
                      "w-full h-9 bg-transparent text-sm focus:outline-none placeholder:text-[var(--color-text-dim)]",
                    submit: "hidden",
                    reset: "hidden",
                    loadingIndicator: "hidden",
                  }}
                  placeholder="Search products, categories, brands"
                  inputRef={inputRef}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
              <ResultsArea
                onSelect={(handle) => {
                  router.push(`/products/${handle}`);
                  setOpen(false);
                }}
              />
              <div className="px-4 py-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-dim)] flex items-center justify-between">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] mr-1">Esc</kbd>
                  to close
                </span>
                <span className="text-[var(--color-text-dim)]">Powered by Algolia</span>
              </div>
            </InstantSearch>
          </div>
        </div>
      )}
    </>
  );
}

function ResultsArea({ onSelect }: { onSelect: (handle: string) => void }) {
  const { results, status, indexUiState } = useInstantSearch();
  const query = indexUiState.query?.trim() ?? "";

  if (!query) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
        Type to search the catalog.
      </div>
    );
  }
  if (status === "loading" || status === "stalled") {
    return (
      <div className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
        Searching…
      </div>
    );
  }
  if ((results?.nbHits ?? 0) === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
        No matches for &ldquo;{query}&rdquo;.
      </div>
    );
  }
  return (
    <Hits
      classNames={{ root: "max-h-[60vh] overflow-y-auto", list: "divide-y divide-[var(--color-border)]" }}
      hitComponent={({ hit }) => {
        const h = hit as unknown as AlgoliaHit;
        return (
          <button
            type="button"
            onClick={() => onSelect(h.handle)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface)] text-left"
          >
            <img
              src={h.thumbnail || "/placeholder-product.svg"}
              alt=""
              className="w-12 h-12 rounded object-cover shrink-0 bg-[var(--color-bg-alt)]"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{h.title}</p>
              {h.category_names && h.category_names.length > 0 && (
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {h.category_names[0]}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-medium">
                {typeof h.price === "number" ? formatJmd(h.price) : "—"}
              </p>
              {/* Stock badge omitted: query.graph doesn't always resolve
                  variant inventory_quantity — the live PDP shows real stock. */}
            </div>
          </button>
        );
      }}
    />
  );
}
