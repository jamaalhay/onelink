"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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

interface LocalSearchResult {
  id: string;
  handle: string;
  title: string;
  thumbnail?: string | null;
  price?: number | null;
  category?: { handle?: string | null; name?: string | null } | null;
}

// Search trigger button + overlay. Uses Algolia when configured and falls
// back to the local Medusa-backed /api/search endpoint in dev/preview.
export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const client = getAlgoliaClient();
  const useAlgolia = algoliaEnabled && !!client;

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const selectProduct = (handle: string) => {
    router.push(`/products/${handle}`);
    setOpen(false);
  };

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
        <SearchShell onClose={() => setOpen(false)}>
          {useAlgolia ? (
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
                <CloseButton onClose={() => setOpen(false)} />
              </div>
              <AlgoliaResultsArea onSelect={selectProduct} />
              <SearchFooter label="Powered by Algolia" />
            </InstantSearch>
          ) : (
            <LocalSearch
              inputRef={inputRef}
              onClose={() => setOpen(false)}
              onSelect={selectProduct}
            />
          )}
        </SearchShell>
      )}
    </>
  );
}

function SearchShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-xl bg-[var(--color-bg)] rounded-[var(--radius-card)] shadow-xl border border-[var(--color-border)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded"
      aria-label="Close"
    >
      <X size={16} />
    </button>
  );
}

function SearchFooter({ label }: { label: string }) {
  return (
    <div className="px-4 py-2 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-dim)] flex items-center justify-between">
      <span>
        <kbd className="px-1.5 py-0.5 rounded border border-[var(--color-border)] mr-1">Esc</kbd>
        to close
      </span>
      <span>{label}</span>
    </div>
  );
}

function AlgoliaResultsArea({ onSelect }: { onSelect: (handle: string) => void }) {
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
            <SearchThumb src={h.thumbnail} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{h.title}</p>
              {h.category_names && h.category_names.length > 0 && (
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {h.category_names[0]}
                </p>
              )}
            </div>
            <p className="text-sm font-medium whitespace-nowrap">
              {typeof h.price === "number" ? formatJmd(h.price) : "—"}
            </p>
          </button>
        );
      }}
    />
  );
}

function LocalSearch({
  inputRef,
  onClose,
  onSelect,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSelect: (handle: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      return;
    }

    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        const data = (await res.json().catch(() => ({}))) as {
          results?: LocalSearchResult[];
          error?: string;
        };
        if (!res.ok) {
          setError(data.error ?? `Search failed (${res.status})`);
          setResults([]);
          return;
        }
        setResults(data.results ?? []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Search failed");
          setResults([]);
        }
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 120);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)]">
        <MagnifyingGlass size={18} className="text-[var(--color-text-muted)] shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-9 bg-transparent text-sm focus:outline-none placeholder:text-[var(--color-text-dim)]"
          placeholder="Search products, categories, brands"
          autoFocus
        />
        <CloseButton onClose={onClose} />
      </div>
      <LocalResultsArea
        query={query.trim()}
        results={results}
        loading={loading}
        error={error}
        onSelect={onSelect}
      />
      <SearchFooter label="Catalog search" />
    </>
  );
}

function LocalResultsArea({
  query,
  results,
  loading,
  error,
  onSelect,
}: {
  query: string;
  results: LocalSearchResult[];
  loading: boolean;
  error: string | null;
  onSelect: (handle: string) => void;
}) {
  if (!query) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
        Type to search the catalog.
      </div>
    );
  }

  if (query.length < 2) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
        Keep typing to search.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
        Searching…
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[var(--color-danger)]">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-[var(--color-text-muted)]">
        No matches for &ldquo;{query}&rdquo;.
      </div>
    );
  }

  return (
    <ul className="max-h-[60vh] overflow-y-auto divide-y divide-[var(--color-border)]">
      {results.map((result) => (
        <li key={result.id}>
          <button
            type="button"
            onClick={() => onSelect(result.handle)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface)] text-left"
          >
            <SearchThumb src={result.thumbnail} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">{result.title}</p>
              {result.category?.name && (
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {result.category.name}
                </p>
              )}
            </div>
            <p className="text-sm font-medium whitespace-nowrap">
              {typeof result.price === "number" ? formatJmd(result.price) : "—"}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function SearchThumb({ src }: { src?: string | null }) {
  return (
    <Image
      src={src || "/placeholder-product.svg"}
      alt=""
      width={48}
      height={48}
      className="w-12 h-12 rounded object-cover shrink-0 bg-[var(--color-bg-alt)]"
      unoptimized
    />
  );
}
