"use client";

import { ArrowRight, Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useGlobalLoading } from "@/components/loading/loading-provider";
import type { HeroSearchResponse, HeroSearchResult } from "./hero.types";
import styles from "./pluto-hero.module.css";

type SearchStatus = "idle" | "loading" | "success" | "empty" | "error";

export function HeroSearch() {
  const router = useRouter();
  const { startLoading } = useGlobalLoading();
  const listboxId = useId();
  const activeOptionId = useId();
  const wrapperRef = useRef<HTMLFormElement>(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HeroSearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      requestIdRef.current += 1;
      return;
    }

    const controller = new AbortController();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const timer = window.setTimeout(async () => {
      setStatus("loading");
      setOpen(true);
      try {
        const response = await fetch(`/api/home/hero-search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as HeroSearchResponse;
        if (requestIdRef.current !== requestId) return;
        setResults(data.results);
        setStatus(data.results.length > 0 ? "success" : "empty");
        setActiveIndex(data.results.length > 0 ? 0 : -1);
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
        setResults([]);
        setStatus("error");
        setOpen(true);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const submitSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const exact = results.find((result) => result.name.toLowerCase() === trimmed.toLowerCase());
    startLoading();
    router.push(exact?.href ?? `/plutos-library/search?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  const selectResult = (result: HeroSearchResult) => {
    startLoading();
    router.push(result.href);
    setOpen(false);
  };

  const liveMessage =
    status === "loading"
      ? "Loading search results"
      : status === "success"
        ? `${results.length} search results available`
        : status === "empty"
          ? "No matching tools found"
          : status === "error"
            ? "Search failed. Try again."
            : "";

  return (
    <form
      action="/plutos-library/search"
      className={styles.searchForm}
      onSubmit={(event) => {
        event.preventDefault();
        submitSearch();
      }}
      ref={wrapperRef}
    >
      <label className={styles.searchField}>
        <Search aria-hidden="true" className={styles.searchSparkle} />
        <span className="sr-only">Describe your task</span>
        <input
          aria-activedescendant={activeIndex >= 0 ? `${activeOptionId}-${activeIndex}` : undefined}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={open}
          autoComplete="off"
          className={styles.searchInput}
          name="q"
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (value.trim().length < 2) {
              setResults([]);
              setStatus("idle");
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              return;
            }
            if (!open || results.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, results.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              selectResult(results[activeIndex]);
            }
          }}
          placeholder="Search your AI tools"
          role="combobox"
          value={query}
        />
      </label>
      <button className={styles.searchButton} type="submit">
        Find Tools
      </button>

      {open ? (
        <div className={styles.resultsPanel} id={listboxId} role="listbox" aria-label="AI tool suggestions">
          {status === "loading" ? (
            <div className={styles.panelState}>
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              Searching Discover
            </div>
          ) : null}
          {status === "success"
            ? results.map((result, index) => (
                <button
                  aria-selected={activeIndex === index}
                  className={styles.resultItem}
                  id={`${activeOptionId}-${index}`}
                  key={result.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectResult(result)}
                  role="option"
                  type="button"
                >
                  <span className={styles.resultLogo}>
                    {result.logoUrl ? (
                      <Image alt="" fill sizes="40px" src={result.logoUrl} />
                    ) : (
                      <Search aria-hidden="true" />
                    )}
                  </span>
                  <span className={styles.resultText}>
                    <span className={styles.resultName}>{result.name}</span>
                    <span className={styles.resultDescription}>{result.shortDescription}</span>
                    <span className={styles.resultMeta}>
                      {result.category}
                      {result.subcategory ? ` / ${result.subcategory}` : ""} / {result.pricingLabel}
                    </span>
                  </span>
                  <ArrowRight aria-hidden="true" className={styles.resultArrow} />
                </button>
              ))
            : null}
          {status === "empty" ? (
            <div className={styles.panelState}>Pluto couldn&apos;t find a match. Try describing the task differently.</div>
          ) : null}
          {status === "error" ? (
            <div className={styles.panelState}>Search is having trouble. Try again in a moment.</div>
          ) : null}
        </div>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>
    </form>
  );
}

