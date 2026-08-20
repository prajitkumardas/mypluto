"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildLibraryHref, quickSearches, type LibraryCategory, type LibrarySuggestion } from "@/lib/plutos-library";
import { cn } from "@/lib/utils";

type LibrarySearchProps = {
  categories: LibraryCategory[];
  initial: {
    q?: string;
    category?: string;
    verification?: string;
  };
};

const verificationOptions = [
  ["", "Any verification"],
  ["verified", "Verified"],
  ["needs-verification", "Needs verification"],
  ["recently-verified", "Recently verified"]
];

export function LibrarySearch({ categories, initial }: LibrarySearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const wrapperRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState(initial.q ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [verification, setVerification] = useState(initial.verification ?? "");
  const [suggestions, setSuggestions] = useState<LibrarySuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/plutos-library/suggestions?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Suggestion request failed");
        const data = (await response.json()) as { suggestions: LibrarySuggestion[] };
        setSuggestions(data.suggestions);
        setOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if ((error as DOMException).name !== "AbortError") {
          setSuggestions([]);
          setOpen(true);
        }
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const submitSearch = () => {
    router.push(
      buildLibraryHref("/plutos-library/search", {
        q: query,
        category,
        verification
      })
    );
    setOpen(false);
  };

  const selectSuggestion = (suggestion: LibrarySuggestion) => {
    router.push(suggestion.href);
    setOpen(false);
  };

  return (
    <div>
      <form
        action="/plutos-library/search"
        className="mt-10 grid gap-3 rounded-3xl border border-neutral-200 bg-white p-3 shadow-card lg:grid-cols-[1fr_auto_auto_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
        }}
        ref={wrapperRef}
      >
        <div className="relative">
          <label className="flex min-h-14 items-center gap-3 rounded-2xl bg-neutral-50 px-4">
            <Search aria-hidden="true" className="h-5 w-5 text-violet-600" />
            <span className="sr-only">Search Pluto&apos;s Library</span>
            <input
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={open}
              className="w-full bg-transparent text-base outline-none placeholder:text-neutral-500"
              name="q"
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => query.trim().length >= 2 && setOpen(true)}
              onKeyDown={(event) => {
                if (!open || suggestions.length === 0) return;
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
                }
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((index) => Math.max(index - 1, 0));
                }
                if (event.key === "Enter" && activeIndex >= 0) {
                  event.preventDefault();
                  selectSuggestion(suggestions[activeIndex]);
                }
                if (event.key === "Escape") {
                  setOpen(false);
                }
              }}
              placeholder="What do you want to create, solve or automate?"
              value={query}
            />
          </label>
          {open ? (
            <div
              aria-label="Search suggestions"
              className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-elevated"
              id={listboxId}
              role="listbox"
            >
              {loading ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-neutral-600">
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Loading suggestions
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    aria-selected={activeIndex === index}
                    className={cn(
                      "flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left text-sm transition hover:bg-neutral-50",
                      activeIndex === index && "bg-violet-50"
                    )}
                    key={`${suggestion.type}-${suggestion.href}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                    role="option"
                    type="button"
                  >
                    <span>
                      <span className="block font-semibold text-neutral-900">{suggestion.label}</span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                        {suggestion.type} {suggestion.meta ? `- ${suggestion.meta}` : ""}
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4 text-violet-600" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm font-semibold text-neutral-600">No matches found</div>
              )}
            </div>
          ) : null}
        </div>

        <label className="sr-only" htmlFor="library-category-filter">
          Category filter
        </label>
        <select
          className="min-h-14 rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold"
          id="library-category-filter"
          name="category"
          onChange={(event) => setCategory(event.target.value)}
          value={category}
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="library-verification-filter">
          Verification filter
        </label>
        <select
          className="min-h-14 rounded-2xl border border-neutral-200 bg-white px-3 text-sm font-semibold"
          id="library-verification-filter"
          name="verification"
          onChange={(event) => setVerification(event.target.value)}
          value={verification}
        >
          {verificationOptions.map(([value, label]) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>

        <Button type="submit">
          Search <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap">
        {quickSearches.map((chip) => {
          const href = buildLibraryHref("/plutos-library/search", {
            q: chip.params.query,
            category: chip.params.category,
            pricing: chip.params.pricing,
            api: chip.params.api
          });

          return (
            <button
              className="focus-ring min-h-11 shrink-0 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:border-violet-500 hover:text-violet-600"
              key={chip.id}
              onClick={() => {
                setQuery(chip.params.query);
                setCategory(chip.params.category ?? "");
                router.push(href);
              }}
              type="button"
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
