import dataset from "@/data/generated/plutos-library.json";

const NEEDS_VERIFICATION_STATUSES = [
  "Needs verification",
  "Not verified",
  "Partially verified",
  "Uncertain status"
];

export type LibraryCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  toolCount: number;
  subcategoryCount: number;
  exampleSubcategories: string[];
};

export type LibrarySubcategory = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  toolCount: number;
};

export type LibraryTool = {
  id: string;
  slug: string;
  name: string;
  officialUrl: string;
  originalOfficialUrl: string;
  domain: string;
  shortDescription: string;
  categories: string[];
  subcategories: string[];
  features: string[];
  platforms: string[];
  useCases: string[];
  targetAudiences: string[];
  limitations: string;
  pricing: {
    model: string;
    freePlanRaw: string;
    freePlan: string;
    startingPriceRaw: string;
  };
  api: {
    raw: string;
    normalized: string;
    notes: string;
  };
  verification: {
    status: string;
    lastVerifiedRaw: string;
    sourceRaw: string;
  };
  status: string;
  similarTools: Array<{
    slug: string;
    score: number;
    reason: string;
  }>;
};

type LibraryDataset = {
  generatedAt: string;
  sourceWorkbook: string;
  recentlyAdded?: Array<{
    toolName: string;
    categoryName: string;
    dateAdded: string;
    notes: string;
  }>;
  categories: LibraryCategory[];
  subcategories: LibrarySubcategory[];
  tools: LibraryTool[];
  importErrors: unknown[];
};

export const plutosLibrary = dataset as LibraryDataset;

export type LibrarySearchParams = {
  query?: string;
  category?: string;
  subcategory?: string;
  pricing?: string;
  platform?: string;
  api?: string;
  verification?: string;
  sort?: string;
  page?: string | number;
  limit?: string | number;
};

export type LibrarySearchResult = {
  tools: LibraryTool[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  filters: Required<Pick<
    LibrarySearchParams,
    "query" | "category" | "subcategory" | "pricing" | "platform" | "api" | "verification" | "sort"
  >>;
};

export type LibrarySuggestion = {
  type: "tool" | "category" | "subcategory";
  label: string;
  href: string;
  meta?: string;
};

type QuickSearch = {
  id: string;
  label: string;
  params: {
    query: string;
    category?: string;
    pricing?: string;
    api?: string;
  };
};

export const quickSearches: QuickSearch[] = [
  {
    id: "ai-writing-tool",
    label: "AI writing tool",
    params: { query: "AI writing tool", category: "ai-writing-and-content" }
  },
  {
    id: "free-image-generator",
    label: "Free image generator",
    params: {
      query: "image generator",
      category: "ai-image-generation-and-design",
      pricing: "free"
    }
  },
  {
    id: "api-access",
    label: "API access",
    params: { query: "API access", api: "yes" }
  },
  {
    id: "legal-research",
    label: "Legal research",
    params: { query: "legal research", category: "ai-legal" }
  }
];

export function getLibraryTool(slug: string) {
  return plutosLibrary.tools.find((tool) => tool.slug === slug);
}

export function getLibraryCategory(slug: string) {
  return plutosLibrary.categories.find((category) => category.slug === slug);
}

export function getLibrarySubcategories(categorySlug: string) {
  const category = getLibraryCategory(categorySlug);
  if (!category) return [];
  return plutosLibrary.subcategories.filter((item) => item.categoryId === category.id);
}

export function getLibraryStatistics() {
  const verifiedTools = plutosLibrary.tools.filter((tool) => tool.verification.status === "Verified").length;
  const freeTools = plutosLibrary.tools.filter((tool) => hasFreePlan(tool)).length;

  return {
    categories: plutosLibrary.categories.length,
    subcategories: plutosLibrary.subcategories.length,
    tools: plutosLibrary.tools.length,
    verifiedTools,
    freeTools,
    needsVerification: plutosLibrary.tools.filter((tool) =>
      NEEDS_VERIFICATION_STATUSES.includes(tool.verification.status)
    ).length
  };
}

export function getCategoryToolCount(categorySlug: string) {
  return plutosLibrary.tools.filter((tool) => toolBelongsToCategory(tool, categorySlug)).length;
}

export function getSubcategoryToolCount(categorySlug: string, subcategorySlug: string) {
  return plutosLibrary.tools.filter(
    (tool) =>
      toolBelongsToCategory(tool, categorySlug) &&
      tool.subcategories.some((subcategory) => slugify(subcategory) === subcategorySlug)
  ).length;
}

export function getPlatformOptions() {
  return [...new Set(plutosLibrary.tools.flatMap((tool) => tool.platforms))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 40);
}

export function searchLibraryTools(params: LibrarySearchParams = {}) {
  return getLibrarySearchResults({ ...params, limit: plutosLibrary.tools.length }).tools;
}

export function getLibrarySearchResults({
  query = "",
  category = "",
  subcategory = "",
  pricing = "",
  platform = "",
  api = "",
  verification = "",
  sort = "relevant",
  page = 1,
  limit = 24
}: LibrarySearchParams = {}): LibrarySearchResult {
  const normalized = {
    query: sanitizeSearchValue(query),
    category: sanitizeSearchValue(category),
    subcategory: sanitizeSearchValue(subcategory),
    pricing: sanitizeSearchValue(pricing),
    platform: sanitizeSearchValue(platform),
    api: sanitizeSearchValue(api),
    verification: sanitizeSearchValue(verification),
    sort: sanitizeSearchValue(sort) || "relevant"
  };
  const pageSize = clampNumber(limit, 1, 60, 24);
  const currentPage = clampNumber(page, 1, 999, 1);
  const terms = normalized.query.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = plutosLibrary.tools
    .map((tool) => ({ tool, score: getToolSearchScore(tool, terms) }))
    .filter(({ tool, score }) => {
      const matchesQuery = terms.length === 0 || score > 0;
      const matchesCategory = !normalized.category || toolBelongsToCategory(tool, normalized.category);
      const matchesSubcategory =
        !normalized.subcategory ||
        tool.subcategories.some((name) => slugify(name) === normalized.subcategory);
      const matchesPricing = matchesPricingFilter(tool, normalized.pricing);
      const matchesApi = matchesApiFilter(tool, normalized.api);
      const matchesPlatform =
        !normalized.platform ||
        tool.platforms.some((item) => slugify(item) === normalized.platform);
      const matchesVerification = matchesVerificationFilter(tool, normalized.verification);

      return (
        matchesQuery &&
        matchesCategory &&
        matchesSubcategory &&
        matchesPricing &&
        matchesApi &&
        matchesPlatform &&
        matchesVerification
      );
    });

  scored.sort((a, b) => compareTools(a, b, normalized.sort));

  const total = scored.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const offset = (safePage - 1) * pageSize;

  return {
    tools: scored.slice(offset, offset + pageSize).map((item) => item.tool),
    total,
    page: safePage,
    pageSize,
    pageCount,
    filters: normalized
  };
}

export function getSimilarLibraryTools(tool: LibraryTool) {
  return tool.similarTools
    .map((similar) => ({
      ...similar,
      tool: getLibraryTool(similar.slug)
    }))
    .filter((item) => item.tool)
    .slice(0, 6);
}

export function getLibrarySuggestions(query: string, limit = 8): LibrarySuggestion[] {
  const normalizedQuery = sanitizeSearchValue(query).toLowerCase();
  if (normalizedQuery.length < 2) return [];

  const toolSuggestions = plutosLibrary.tools
    .map((tool) => ({
      item: tool,
      score: getToolSearchScore(tool, normalizedQuery.split(/\s+/).filter(Boolean))
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ item }) => ({
      type: "tool" as const,
      label: item.name,
      href: `/plutos-library/tool/${item.slug}`,
      meta: item.categories[0] ?? "AI tool"
    }));

  const categorySuggestions = plutosLibrary.categories
    .filter((category) => searchableText(category.name, category.description).includes(normalizedQuery))
    .slice(0, 3)
    .map((category) => ({
      type: "category" as const,
      label: category.name,
      href: `/plutos-library/${category.slug}`,
      meta: `${category.toolCount} tools`
    }));

  const subcategorySuggestions = plutosLibrary.subcategories
    .filter((subcategory) => searchableText(subcategory.name, subcategory.categoryName).includes(normalizedQuery))
    .slice(0, 3)
    .map((subcategory) => ({
      type: "subcategory" as const,
      label: subcategory.name,
      href: `/plutos-library/${slugify(subcategory.categoryName)}?subcategory=${subcategory.slug}`,
      meta: subcategory.categoryName
    }));

  return [...toolSuggestions, ...categorySuggestions, ...subcategorySuggestions].slice(0, limit);
}

export function getTrendingTools(range: string, limit = 8) {
  const recentNames = new Set(
    (plutosLibrary.recentlyAdded ?? [])
      .filter((item) => range === "all" || item.dateAdded || item.categoryName)
      .map((item) => item.toolName.toLowerCase())
  );

  const recentlyAdded = plutosLibrary.tools
    .filter((tool) => recentNames.has(tool.name.toLowerCase()))
    .slice(0, limit);

  if (recentlyAdded.length > 0) return recentlyAdded;

  return [...plutosLibrary.tools]
    .sort((a, b) => {
      const left = Number(a.verification.status === "Verified") + a.features.length / 100;
      const right = Number(b.verification.status === "Verified") + b.features.length / 100;
      return right - left || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function buildLibraryHref(pathname: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && String(value).trim()) {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function verificationTone(status: string): "success" | "warning" | "neutral" | "danger" {
  const normalized = status.toLowerCase();
  if (normalized === "verified") return "success";
  if (normalized.includes("needs") || normalized.includes("partial")) return "warning";
  if (normalized.includes("sunsetting") || normalized.includes("unavailable")) return "danger";
  return "neutral";
}

function sanitizeSearchValue(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function clampNumber(value: string | number | undefined, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function toolBelongsToCategory(tool: LibraryTool, categorySlug: string) {
  return tool.categories.some((name) => slugify(name) === categorySlug || name === categorySlug);
}

function hasFreePlan(tool: LibraryTool) {
  const freePlan = tool.pricing.freePlan.toLowerCase();
  const model = tool.pricing.model.toLowerCase();
  return freePlan === "yes" || model.includes("free") || model.includes("freemium");
}

function matchesPricingFilter(tool: LibraryTool, filter: string) {
  if (!filter) return true;
  const normalized = filter.toLowerCase();
  const combined = `${tool.pricing.model} ${tool.pricing.freePlan} ${tool.pricing.freePlanRaw}`.toLowerCase();
  if (normalized === "free") return hasFreePlan(tool);
  if (normalized === "paid") return !hasFreePlan(tool) && !combined.includes("unknown");
  if (normalized === "unknown") return combined.includes("unknown") || combined.includes("unclear");
  return combined.includes(normalized);
}

function matchesApiFilter(tool: LibraryTool, filter: string) {
  if (!filter) return true;
  const normalized = filter.toLowerCase();
  const api = tool.api.normalized.toLowerCase();
  if (normalized === "yes") return api === "yes" || api.includes("limited") || api.includes("enterprise");
  if (normalized === "no") return api === "no";
  return api.includes(normalized);
}

function matchesVerificationFilter(tool: LibraryTool, filter: string) {
  if (!filter) return true;
  const status = tool.verification.status.toLowerCase();
  if (filter === "verified") return status === "verified";
  if (filter === "needs-verification") {
    return NEEDS_VERIFICATION_STATUSES.some((item) => item.toLowerCase() === status);
  }
  if (filter === "recently-verified") {
    return status === "verified" && /^\d{4}-\d{2}-\d{2}$/.test(tool.verification.lastVerifiedRaw);
  }
  return status.includes(filter.toLowerCase());
}

function searchableText(...parts: Array<string | string[]>) {
  return parts.flat().join(" ").toLowerCase();
}

function getToolSearchScore(tool: LibraryTool, terms: string[]) {
  if (terms.length === 0) return 0;
  const fields = [
    [tool.name, 12],
    [tool.shortDescription, 7],
    [tool.categories.join(" "), 6],
    [tool.subcategories.join(" "), 6],
    [tool.features.join(" "), 5],
    [tool.useCases.join(" "), 5],
    [tool.targetAudiences.join(" "), 4],
    [tool.platforms.join(" "), 2],
    [tool.pricing.model, 2],
    [tool.api.raw, 2],
    [tool.limitations, 1]
  ] as const;

  return terms.reduce((total, term) => {
    return (
      total +
      fields.reduce((fieldTotal, [value, weight]) => {
        const text = value.toLowerCase();
        if (text === term) return fieldTotal + weight * 2;
        if (text.includes(term)) return fieldTotal + weight;
        return fieldTotal;
      }, 0)
    );
  }, 0);
}

function compareTools(
  a: { tool: LibraryTool; score: number },
  b: { tool: LibraryTool; score: number },
  sort: string
) {
  if (sort === "name-az") return a.tool.name.localeCompare(b.tool.name);
  if (sort === "highest-rated") return b.tool.features.length - a.tool.features.length || b.score - a.score;
  if (sort === "newest" || sort === "recently-verified") {
    return b.tool.verification.lastVerifiedRaw.localeCompare(a.tool.verification.lastVerifiedRaw);
  }
  if (sort === "popular" || sort === "trending") {
    return (
      b.tool.similarTools.length - a.tool.similarTools.length ||
      b.tool.categories.length - a.tool.categories.length ||
      b.score - a.score
    );
  }
  return b.score - a.score || a.tool.name.localeCompare(b.tool.name);
}
