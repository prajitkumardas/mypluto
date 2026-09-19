import Link from "next/link";
import { RotateCcw, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlutoButton } from "@/components/ui/pluto-button";
import { StatePanel } from "@/components/shared/state-panel";
import { AutoSubmitSelect } from "@/components/library/auto-submit-select";
import { LibraryToolCard } from "@/components/library/library-tool-card";
import { buildLibraryHref, plutosLibrary, slugify, type LibrarySearchResult } from "@/lib/plutos-library";
import { cn } from "@/lib/utils";

type SearchResultsProps = {
  result: LibrarySearchResult;
  basePath?: string;
  compact?: boolean;
  embedded?: boolean;
};

type ActiveFilter = {
  key: FilterKey;
  label: string;
  removable: boolean;
  value: string;
};

type FilterKey = "query" | "category" | "pricing" | "platform" | "api" | "verification";

const sortOptions: Array<[string, string]> = [
  ["relevant", "Most relevant"],
  ["popular", "Most popular"],
  ["highest-rated", "Highest rated"],
  ["newest", "Newest"],
  ["recently-verified", "Recently verified"],
  ["name-az", "Name: A-Z"],
  ["trending", "Trending"]
];

export function SearchResults({ result, basePath = "/plutos-library/search", compact = false, embedded = false }: SearchResultsProps) {
  const activeFilters = getActiveFilters(result.filters, basePath);
  const resultContext = formatFilterValue("category", result.filters.category);

  return (
    <section
      className={cn(
        embedded ? "w-full pb-20" : "mx-auto w-full max-w-site px-5 pb-20 sm:px-8 xl:px-0",
        embedded ? "pt-8 md:pt-9" : compact ? "pt-10 md:pt-12" : "pt-32 md:pt-36"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-5">
          <h2 className="type-h2 text-neutral-900">
            {resultContext ? `${result.total} AI tools` : `${result.total} tools`}
          </h2>
          {resultContext ? (
            <p className="type-body-sm text-neutral-500">Curated for {resultContext}</p>
          ) : null}
          <p className="sr-only" aria-live="polite">
            {result.total} Discover results are available.
          </p>
        </div>
        <form action={basePath} className="relative w-full sm:w-auto">
          {Object.entries(result.filters).map(([key, value]) =>
            key === "sort" || !value ? null : (
              <input key={key} name={key === "query" ? "q" : key} type="hidden" value={value} />
            )
          )}
          <label className="sr-only" htmlFor="library-sort">
            Sort tools
          </label>
          <AutoSubmitSelect
            defaultValue={result.filters.sort}
            id="library-sort"
            name="sort"
            options={sortOptions}
          />
        </form>
      </div>

      {activeFilters.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {activeFilters.map((filter) => (
            <span
              className="pf-filter-chip"
              key={`${filter.key}-${filter.value}`}
            >
              {filter.label}
              {filter.removable ? (
                <Link
                  aria-label={`Remove ${filter.label} filter`}
                  className="grid h-7 w-7 place-items-center rounded-full text-violet-100 transition hover:bg-white/10 hover:text-white"
                  href={getRemoveFilterHref(result.filters, basePath, filter.key)}
                >
                  <X aria-hidden="true" className="h-4 w-4" />
                </Link>
              ) : null}
            </span>
          ))}
          <Button asChild variant="ghost">
            <Link href={basePath}>
              <RotateCcw aria-hidden="true" className="h-4 w-4" />
              Clear all
            </Link>
          </Button>
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-3 type-body-sm text-neutral-500">
        <ShieldAlert aria-hidden="true" className="h-5 w-5 shrink-0 text-violet-400" />
        Pricing may change - verify details on the official website.
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
    pricing: result.filters.pricing,
    platform: result.filters.platform,
    api: result.filters.api,
    verification: result.filters.verification,
    sort: result.filters.sort
  };

  return (
    <nav className="pf-pagination mt-8" aria-label="Results pagination">
      <p className="number type-label-md text-neutral-500">
        Page {result.page} of {result.pageCount}
      </p>
      <div className="pf-pagination-actions">
        <PlutoButton disabled={result.page <= 1} href={buildLibraryHref(basePath, { ...common, page: Math.max(1, result.page - 1) })} variant="secondary">
          Previous
        </PlutoButton>
        <PlutoButton disabled={result.page >= result.pageCount} href={buildLibraryHref(basePath, { ...common, page: Math.min(result.pageCount, result.page + 1) })} showArrow variant="primary">
          Next
        </PlutoButton>
      </div>
    </nav>
  );
}

function getActiveFilters(filters: LibrarySearchResult["filters"], basePath: string): ActiveFilter[] {
  const categoryLabel = formatFilterValue("category", filters.category);
  const isCategoryPage = basePath.startsWith("/plutos-library/") && Boolean(filters.category);

  const activeFilters: ActiveFilter[] = [
    { key: "category", label: categoryLabel, removable: !isCategoryPage, value: filters.category },
    { key: "query", label: filters.query ? `Search: ${filters.query}` : "", removable: true, value: filters.query },
    { key: "pricing", label: formatFilterValue("pricing", filters.pricing), removable: true, value: filters.pricing },
    { key: "platform", label: formatFilterValue("platform", filters.platform), removable: true, value: filters.platform },
    { key: "api", label: formatFilterValue("api", filters.api), removable: true, value: filters.api },
    { key: "verification", label: formatFilterValue("verification", filters.verification), removable: true, value: filters.verification }
  ];

  return activeFilters.filter((filter) => filter.value && filter.label);
}

function getRemoveFilterHref(filters: LibrarySearchResult["filters"], basePath: string, keyToRemove: FilterKey) {
  const next = {
    q: keyToRemove === "query" ? undefined : filters.query,
    category: keyToRemove === "category" ? undefined : filters.category,
    pricing: keyToRemove === "pricing" ? undefined : filters.pricing,
    platform: keyToRemove === "platform" ? undefined : filters.platform,
    api: keyToRemove === "api" ? undefined : filters.api,
    verification: keyToRemove === "verification" ? undefined : filters.verification,
    sort: filters.sort === "relevant" ? undefined : filters.sort
  };

  return buildLibraryHref(basePath, next);
}

function formatFilterValue(key: FilterKey, value: string) {
  if (!value) return "";

  if (key === "category") {
    return plutosLibrary.categories.find((category) => category.slug === value)?.name ?? titleize(value);
  }

  if (key === "pricing") {
    return ({ free: "Free plan", paid: "Paid", unknown: "Unknown" } as Record<string, string>)[value] ?? titleize(value);
  }

  if (key === "api") {
    return ({ yes: "API available", no: "No API" } as Record<string, string>)[value] ?? titleize(value);
  }

  if (key === "verification") {
    return (
      ({
        verified: "Verified",
        "needs-verification": "Needs verification",
        "recently-verified": "Recently verified"
      } as Record<string, string>)[value] ?? titleize(value)
    );
  }

  if (key === "platform") {
    return plutosLibrary.tools.flatMap((tool) => tool.platforms).find((platform) => slugify(platform) === value) ?? titleize(value);
  }

  return value;
}

function titleize(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
