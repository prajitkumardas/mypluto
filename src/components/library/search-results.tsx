import Link from "next/link";
import { ArrowRight, Filter, RotateCcw, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/shared/state-panel";
import { LibraryToolCard } from "@/components/library/library-tool-card";
import { buildLibraryHref, type LibrarySearchResult } from "@/lib/plutos-library";

type SearchResultsProps = {
  result: LibrarySearchResult;
  basePath?: string;
};

const sortOptions = [
  ["relevant", "Most relevant"],
  ["popular", "Most popular"],
  ["highest-rated", "Highest rated"],
  ["newest", "Newest"],
  ["recently-verified", "Recently verified"],
  ["name-az", "Name: A-Z"],
  ["trending", "Trending"]
];

export function SearchResults({ result, basePath = "/plutos-library/search" }: SearchResultsProps) {
  const activeFilters = getActiveFilters(result.filters);

  return (
    <section className="mx-auto max-w-site px-5 pb-20 sm:px-8 xl:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge tone="neutral">
            <Filter aria-hidden="true" className="h-3.5 w-3.5" />
            Results
          </Badge>
          <h2 className="mt-3 font-heading text-4xl font-bold text-neutral-900">
            {result.total} matching tools
          </h2>
          <p className="sr-only" aria-live="polite">
            {result.total} Pluto&apos;s Library results are available.
          </p>
        </div>
        <form action={basePath} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {Object.entries(result.filters).map(([key, value]) =>
            key === "sort" || !value ? null : (
              <input key={key} name={key === "query" ? "q" : key} type="hidden" value={value} />
            )
          )}
          <label className="sr-only" htmlFor="library-sort">
            Sort tools
          </label>
          <select
            className="min-h-11 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold shadow-card"
            defaultValue={result.filters.sort}
            id="library-sort"
            name="sort"
          >
            {sortOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Sort
          </Button>
        </form>
      </div>

      {activeFilters.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <span
              className="rounded-lg bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700"
              key={`${filter.key}-${filter.value}`}
            >
              {filter.label}: {filter.value}
            </span>
          ))}
          <Button asChild variant="ghost">
            <Link href={basePath}>
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Clear all filters
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl bg-[#FFF3D1] p-4 text-sm font-semibold text-[#976500]">
        <ShieldAlert aria-hidden="true" className="mb-2 h-5 w-5" />
        Some records are not fully verified. Confirm pricing on official websites before buying.
      </div>

      {result.tools.length > 0 ? (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {result.tools.map((tool) => (
              <LibraryToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
          <Pagination result={result} basePath={basePath} />
        </>
      ) : (
        <div className="mt-8">
          <StatePanel
            action="Clear filters"
            actionHref={basePath}
            copy="No tools match this search. Try another keyword, clear one filter, or browse all categories."
            secondary="Browse all categories"
            secondaryHref="/plutos-library"
            title="No search results"
          />
        </div>
      )}
    </section>
  );
}

function Pagination({ result, basePath }: { result: LibrarySearchResult; basePath: string }) {
  if (result.pageCount <= 1) return null;

  const common = {
    q: result.filters.query,
    category: result.filters.category,
    subcategory: result.filters.subcategory,
    pricing: result.filters.pricing,
    platform: result.filters.platform,
    api: result.filters.api,
    verification: result.filters.verification,
    sort: result.filters.sort
  };

  return (
    <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-label="Results pagination">
      <p className="number text-sm font-semibold text-neutral-500">
        Page {result.page} of {result.pageCount}
      </p>
      <div className="flex gap-2">
        <Button asChild disabled={result.page <= 1} variant="secondary">
          <Link href={buildLibraryHref(basePath, { ...common, page: Math.max(1, result.page - 1) })}>
            Previous
          </Link>
        </Button>
        <Button asChild disabled={result.page >= result.pageCount}>
          <Link href={buildLibraryHref(basePath, { ...common, page: Math.min(result.pageCount, result.page + 1) })}>
            Load more <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </nav>
  );
}

function getActiveFilters(filters: LibrarySearchResult["filters"]) {
  return [
    { key: "query", label: "Search", value: filters.query },
    { key: "category", label: "Category", value: filters.category },
    { key: "subcategory", label: "Subcategory", value: filters.subcategory },
    { key: "pricing", label: "Pricing", value: filters.pricing },
    { key: "platform", label: "Platform", value: filters.platform },
    { key: "api", label: "API", value: filters.api },
    { key: "verification", label: "Verification", value: filters.verification }
  ].filter((filter) => filter.value);
}
