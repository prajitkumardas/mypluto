"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import { buildLibraryHref, quickSearches, type LibrarySuggestion } from "@/lib/plutos-library";
import { cn } from "@/lib/utils";

type LibrarySearchProps = {
  initial: {
    q?: string;
  };
};

export function LibrarySearch({ initial }: LibrarySearchProps) {
  const router = useRouter();
  const listboxId = useId();
  const wrapperRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState(initial.q ?? "");
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
    router.push(buildLibraryHref("/plutos-library/search", { q: query }));
    setOpen(false);
  };

  const selectSuggestion = (suggestion: LibrarySuggestion) => {
    router.push(suggestion.href);
    setOpen(false);
  };

  return (
    <form
      action="/plutos-library/search"
      className="relative z-30 mx-auto mt-7 -mb-12 max-w-[44rem] rounded-lg border border-white/28 bg-violet-400/28 p-2.5 shadow-[0_18px_42px_rgba(25,16,78,0.34)] backdrop-blur-xl sm:-mb-14 sm:p-3"
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      ref={wrapperRef}
    >
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative min-w-0">
          <label className="flex min-h-10 items-center gap-2 rounded-md border border-white/10 bg-white/16 px-3 transition focus-within:border-lime-400/70 focus-within:ring-2 focus-within:ring-lime-400/15">
            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-white/74" />
            <span className="sr-only">Search Discover</span>
            <input
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={open}
              className="h-full min-h-10 w-full bg-transparent py-0 text-[0.72rem] font-medium leading-none text-white outline-none placeholder:text-white/48"
              name="q"
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                if (value.trim().length < 2) {
                  setSuggestions([]);
                  setOpen(false);
                  setLoading(false);
                }
              }}
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
              placeholder="What are you trying to create, solve or automate?"
              role="combobox"
              value={query}
            />
            {query ? (
              <button
                aria-label="Clear search"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white/58 transition hover:bg-white/10 hover:text-white"
                onClick={() => {
                  setQuery("");
                  setSuggestions([]);
                  setActiveIndex(-1);
                  setOpen(false);
                  setLoading(false);
                }}
                type="button"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </label>
          {open ? (
            <div
              aria-label="Search suggestions"
              className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-white/18 bg-[#111025] p-1.5 shadow-overlay"
              id={listboxId}
              role="listbox"
            >
              {loading ? (
                <div className="flex min-h-10 items-center gap-2 rounded-md px-3 text-[0.76rem] font-semibold text-white/72">
                  <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
                  Loading suggestions
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    aria-selected={activeIndex === index}
                    className={cn(
                      "flex min-h-10 w-full items-center justify-between gap-3 rounded-md px-3 text-left text-[0.76rem] font-semibold text-white/78 transition hover:bg-white/8 hover:text-white",
                      activeIndex === index && "bg-violet-500/18 text-white"
                    )}
                    key={`${suggestion.type}-${suggestion.href}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectSuggestion(suggestion)}
                    role="option"
                    type="button"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-white">{suggestion.label}</span>
                      <span className="block truncate text-[0.64rem] uppercase tracking-[0.06em] text-white/52">
                        {suggestion.type} {suggestion.meta ? `- ${suggestion.meta}` : ""}
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-lime-400" />
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-[0.76rem] font-semibold text-white/68">No matches found</div>
              )}
            </div>
          ) : null}
        </div>

        <button
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-gradient-to-b from-violet-500 to-violet-600 px-4 text-[0.72rem] font-bold leading-none text-white shadow-[0_10px_24px_rgba(108,77,255,0.24)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-lime-400/25"
          type="submit"
        >
          Find my tools
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
        <span className="mr-1 text-[0.62rem] font-semibold leading-none text-white/46">Try:</span>
        {quickSearches.map((chip) => {
          const href = buildLibraryHref("/plutos-library/search", {
            q: chip.params.query,
            category: chip.params.category,
            pricing: chip.params.pricing,
            api: chip.params.api
          });

          return (
            <button
              className="focus-ring min-h-6 shrink-0 rounded-full border border-white/10 bg-white/10 px-2.5 text-[0.58rem] font-semibold leading-none text-white/66 transition hover:border-lime-400/40 hover:text-white"
              key={chip.id}
              onClick={() => {
                setQuery(chip.params.query);
                router.push(href);
              }}
              type="button"
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </form>
  );
}
