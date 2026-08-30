"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { buildLibraryHref, type LibraryCategory } from "@/lib/plutos-library";
import { cn } from "@/lib/utils";

type FilterState = {
  category: string;
  pricing: string;
  verification: string;
  platform: string;
  api: string;
  sort: string;
};

type DropdownOption = {
  label: string;
  value: string;
};

type CategoryDiscoverFiltersProps = {
  basePath: string;
  categories: LibraryCategory[];
  initial: {
    q?: string;
    category?: string;
    pricing?: string;
    verification?: string;
    platform?: string;
    api?: string;
    sort?: string;
  };
  platforms: string[];
  placement?: "hero" | "catalogue";
};

const pricingOptions: DropdownOption[] = [
  { value: "", label: "Pricing" },
  { value: "free", label: "Free plan" },
  { value: "paid", label: "Paid" },
  { value: "unknown", label: "Unknown" }
];

const verificationOptions: DropdownOption[] = [
  { value: "", label: "Verification" },
  { value: "verified", label: "Verified" },
  { value: "needs-verification", label: "Needs verification" },
  { value: "recently-verified", label: "Recently verified" }
];

const apiOptions: DropdownOption[] = [
  { value: "", label: "API" },
  { value: "yes", label: "API available" },
  { value: "no", label: "No API" }
];

export function CategoryDiscoverFilters({
  basePath,
  categories,
  initial,
  platforms,
  placement = "hero"
}: CategoryDiscoverFiltersProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLFormElement>(null);
  const [query, setQuery] = useState(initial.q ?? "");
  const [filters, setFilters] = useState<FilterState>(() => getInitialFilters(initial));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<keyof FilterState | null>(null);
  const filtersRef = useRef(filters);
  const lastHrefRef = useRef(buildHref(basePath, initial.q ?? "", getInitialFilters(initial)));
  const isCataloguePlacement = placement === "catalogue";

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setFiltersOpen(false);
        setOpenDropdown(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const navigate = useCallback(
    (nextQuery: string, nextFilters: FilterState) => {
      const href = buildHref(basePath, nextQuery, nextFilters);
      if (href === lastHrefRef.current) return;
      lastHrefRef.current = href;
      router.push(href, { scroll: false });
    },
    [basePath, router]
  );

  const categoryOptions = useMemo<DropdownOption[]>(
    () => [
      { value: "", label: "All categories" },
      ...categories.map((category) => ({ value: category.slug, label: category.name }))
    ],
    [categories]
  );

  const platformOptions = useMemo<DropdownOption[]>(
    () => [
      { value: "", label: "Platform" },
      ...platforms.map((platform) => ({ value: slugifyOption(platform), label: platform }))
    ],
    [platforms]
  );

  const activeFilterCount = useMemo(
    () => [filters.category, filters.pricing, filters.verification, filters.platform, filters.api].filter(Boolean).length,
    [filters]
  );

  const updateFilter = (name: keyof FilterState, value: string) => {
    const nextFilters = { ...filtersRef.current, [name]: value };
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setOpenDropdown(null);
    navigate(query, nextFilters);
  };

  const clearSearch = () => {
    setQuery("");
    navigate("", filtersRef.current);
  };

  const clearFilters = () => {
    const nextFilters = { ...getInitialFilters({ sort: filters.sort }) };
    filtersRef.current = nextFilters;
    setFilters(nextFilters);
    setOpenDropdown(null);
    navigate(query, nextFilters);
  };

  return (
    <form
      action={basePath}
      className={cn(
        "relative z-50 rounded-[1.35rem] border border-[rgba(255,255,255,0.13)] bg-[rgba(29,29,42,0.86)] p-3 shadow-[0_16px_42px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[18px] lg:p-4",
        isCataloguePlacement ? "m-0 w-full max-w-none" : "mx-auto mb-12 mt-8 max-w-[58rem]"
      )}
      onSubmit={(event) => {
        event.preventDefault();
        navigate(query, filtersRef.current);
      }}
      ref={rootRef}
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_9.5rem_10.5rem]">
        <label className="group flex min-h-14 items-center gap-4 rounded-full border border-[rgba(255,255,255,0.16)] bg-[rgba(21,21,31,0.7)] px-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-xl transition focus-within:border-[rgba(156,122,255,0.48)] focus-within:ring-4 focus-within:ring-violet-500/12 sm:px-6">
          <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-violet-300" />
          <span className="sr-only">Search all AI tools</span>
          <input
            className="h-full min-h-14 w-full rounded-full bg-transparent py-0 type-body-md text-white outline-none placeholder:text-white/44"
            name="q"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                navigate(query, filtersRef.current);
              }
            }}
            placeholder="Search all AI tools..."
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/58 transition hover:bg-white/10 hover:text-white"
              onClick={clearSearch}
              type="button"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : null}
        </label>

        <button
          aria-expanded={filtersOpen}
          className={cn(
            "inline-flex min-h-14 items-center justify-center gap-2 rounded-full border px-5 type-label-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition hover:border-violet-300/30 hover:bg-violet-500/12 focus:outline-none focus:ring-4 focus:ring-violet-500/14",
            filtersOpen || activeFilterCount > 0 ? "border-[rgba(168,137,255,0.34)] bg-[rgba(111,82,255,0.16)]" : "border-[rgba(255,255,255,0.16)] bg-[rgba(21,21,31,0.66)]"
          )}
          onClick={() => {
            setOpenDropdown(null);
            setFiltersOpen((open) => !open);
          }}
          type="button"
        >
          <SlidersHorizontal aria-hidden="true" className="h-5 w-5 text-violet-300" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-lime-400 px-2 type-label-sm text-ink-950">
              {activeFilterCount}
            </span>
          ) : null}
        </button>

        <button
          className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-violet-500 to-violet-600 px-6 type-label-md text-white shadow-[0_16px_36px_rgba(108,77,255,0.36)] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-violet-300/30"
          type="submit"
        >
          <Search aria-hidden="true" className="h-5 w-5" />
          Find tools
        </button>
      </div>

      {filtersOpen ? (
        <div className="absolute left-3 right-3 top-[calc(100%+0.75rem)] z-[90] rounded-[1.35rem] border border-[rgba(255,255,255,0.13)] bg-[rgba(29,29,42,0.94)] p-4 shadow-[0_24px_72px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[18px] lg:left-auto lg:right-4 lg:w-[42rem]">
          <div className="grid gap-3 md:grid-cols-2">
            <FilterDropdown
              isOpen={openDropdown === "category"}
              label="Category"
              name="category"
              onChange={(value) => updateFilter("category", value)}
              onToggle={() => setOpenDropdown((open) => (open === "category" ? null : "category"))}
              options={categoryOptions}
              value={filters.category}
            />

            <FilterDropdown
              isOpen={openDropdown === "pricing"}
              label="Pricing"
              name="pricing"
              onChange={(value) => updateFilter("pricing", value)}
              onToggle={() => setOpenDropdown((open) => (open === "pricing" ? null : "pricing"))}
              options={pricingOptions}
              value={filters.pricing}
            />

            <FilterDropdown
              isOpen={openDropdown === "verification"}
              label="Verification"
              name="verification"
              onChange={(value) => updateFilter("verification", value)}
              onToggle={() => setOpenDropdown((open) => (open === "verification" ? null : "verification"))}
              options={verificationOptions}
              value={filters.verification}
            />

            <FilterDropdown
              isOpen={openDropdown === "platform"}
              label="Platform"
              name="platform"
              onChange={(value) => updateFilter("platform", value)}
              onToggle={() => setOpenDropdown((open) => (open === "platform" ? null : "platform"))}
              options={platformOptions}
              value={filters.platform}
            />

            <FilterDropdown
              isOpen={openDropdown === "api"}
              label="API availability"
              name="api"
              onChange={(value) => updateFilter("api", value)}
              onToggle={() => setOpenDropdown((open) => (open === "api" ? null : "api"))}
              options={apiOptions}
              value={filters.api}
            />
          </div>

          <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
            <button
              className="min-h-10 rounded-full border border-[rgba(255,255,255,0.13)] bg-[rgba(21,21,31,0.7)] px-4 type-label-sm text-white/82 backdrop-blur-xl transition hover:border-violet-300/30 hover:bg-violet-500/12 hover:text-white"
              onClick={clearFilters}
              type="button"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function FilterDropdown({
  isOpen,
  label,
  name,
  onChange,
  onToggle,
  options,
  value
}: {
  isOpen: boolean;
  label: string;
  name: string;
  onChange: (value: string) => void;
  onToggle: () => void;
  options: DropdownOption[];
  value: string;
}) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className="relative min-w-0">
      <input name={name} type="hidden" value={value} />
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
        className={cn(
          "flex min-h-14 w-full items-center justify-between gap-4 rounded-full border px-5 py-0 text-left type-label-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:border-violet-300 focus:border-violet-300 focus:outline-none focus:ring-4 focus:ring-violet-500/18",
          value ? "border-[rgba(168,137,255,0.34)] bg-[rgba(111,82,255,0.16)]" : "border-[rgba(255,255,255,0.16)] bg-[rgba(21,21,31,0.66)]"
        )}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onToggle();
          }
        }}
        type="button"
      >
        <span className={cn("truncate", value ? "text-white" : "text-white/86")}>{selected.label}</span>
        <ChevronDown aria-hidden="true" className={cn("h-5 w-5 shrink-0 text-white/82 transition", isOpen && "rotate-180")} />
      </button>

      {isOpen ? (
        <div
          className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-auto rounded-[1.35rem] border border-[rgba(255,255,255,0.13)] bg-[rgba(29,29,42,0.96)] p-1.5 shadow-[0_22px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl"
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  "flex min-h-11 w-full items-center justify-between gap-3 rounded-full px-4 py-2 text-left type-label-md text-white/78 transition hover:bg-white/8 hover:text-white",
                  isSelected && "bg-violet-500/18 text-white"
                )}
                key={`${name}-${option.value || "all"}`}
                onClick={() => onChange(option.value)}
                role="option"
                type="button"
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-lime-400" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function getInitialFilters(initial: CategoryDiscoverFiltersProps["initial"]): FilterState {
  return {
    category: initial.category ?? "",
    pricing: initial.pricing ?? "",
    verification: initial.verification ?? "",
    platform: initial.platform ?? "",
    api: initial.api ?? "",
    sort: initial.sort ?? "relevant"
  };
}

function buildHref(basePath: string, query: string, filters: FilterState) {
  return buildLibraryHref(basePath, {
    category: filters.category,
    q: query,
    pricing: filters.pricing,
    verification: filters.verification,
    platform: filters.platform,
    api: filters.api,
    sort: filters.sort === "relevant" ? undefined : filters.sort
  });
}

function slugifyOption(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}