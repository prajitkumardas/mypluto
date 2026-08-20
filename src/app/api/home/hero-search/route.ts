import { createClient } from "@supabase/supabase-js";
import { getLibrarySearchResults, type LibraryTool } from "@/lib/plutos-library";
import type { HeroSearchResponse, HeroSearchResult } from "@/components/home/hero.types";

export const dynamic = "force-dynamic";

const RESULT_LIMIT = 8;

type SupabaseToolRow = {
  id?: unknown;
  slug?: unknown;
  name?: unknown;
  short_description?: unknown;
  full_description?: unknown;
  logo_url?: unknown;
  pricing_type?: unknown;
  has_free_plan?: unknown;
  api_status?: unknown;
  platforms?: unknown;
  key_features?: unknown;
  best_for?: unknown;
  categories?: unknown;
  subcategories?: unknown;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = sanitizeSearchQuery(searchParams.get("q") ?? "");

  if (query.length < 2) {
    return Response.json({ results: [], source: "local" } satisfies HeroSearchResponse);
  }

  const supabaseResults = await searchSupabase(query);
  if (supabaseResults.length > 0) {
    return Response.json({ results: supabaseResults, source: "supabase" } satisfies HeroSearchResponse);
  }

  return Response.json({
    results: searchLocalLibrary(query),
    source: "local"
  } satisfies HeroSearchResponse);
}

async function searchSupabase(query: string): Promise<HeroSearchResult[]> {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return [];

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false }
  });

  const safePattern = `%${escapeIlike(query)}%`;
  const { data, error } = await supabase
    .from("tools")
    .select(
      "id, slug, name, short_description, full_description, logo_url, pricing_type, has_free_plan, api_status, platforms, key_features, best_for, categories(name, slug), subcategories(name, slug)"
    )
    .eq("is_active", true)
    .or(
      [
        `name.ilike.${safePattern}`,
        `short_description.ilike.${safePattern}`,
        `full_description.ilike.${safePattern}`,
        `pricing_type.ilike.${safePattern}`,
        `api_status.ilike.${safePattern}`
      ].join(",")
    )
    .limit(RESULT_LIMIT * 2);

  if (error || !Array.isArray(data)) return [];

  return data
    .map((row) => mapSupabaseRow(row as SupabaseToolRow, query))
    .filter((result): result is HeroSearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, RESULT_LIMIT);
}

function searchLocalLibrary(query: string): HeroSearchResult[] {
  return getLibrarySearchResults({ query, limit: RESULT_LIMIT }).tools
    .map((tool) => mapLibraryTool(tool, query))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, RESULT_LIMIT);
}

function mapSupabaseRow(row: SupabaseToolRow, query: string): HeroSearchResult | null {
  const slug = readString(row.slug);
  const name = readString(row.name);
  if (!slug || !name) return null;

  const category = readRelatedName(row.categories) || "AI tool";
  const subcategory = readRelatedName(row.subcategories);
  const description = readString(row.short_description) || readString(row.full_description) || "AI tool in Pluto's Library.";
  const pricingLabel = getPricingLabel(readString(row.pricing_type), row.has_free_plan === true);
  const searchableFields = [
    name,
    description,
    category,
    subcategory,
    pricingLabel,
    readString(row.api_status),
    readStringArray(row.platforms).join(" "),
    readStringArray(row.key_features).join(" "),
    readStringArray(row.best_for).join(" ")
  ];

  return {
    id: readString(row.id) || slug,
    slug,
    name,
    href: `/plutos-library/tool/${slug}`,
    shortDescription: description,
    category,
    subcategory,
    pricingLabel,
    logoUrl: readString(row.logo_url) || null,
    score: scoreResult(query, searchableFields)
  };
}

function mapLibraryTool(tool: LibraryTool, query: string): HeroSearchResult {
  const pricingLabel = getPricingLabel(tool.pricing.model, tool.pricing.freePlan.toLowerCase() === "yes");
  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    href: `/plutos-library/tool/${tool.slug}`,
    shortDescription: tool.shortDescription,
    category: tool.categories[0] ?? "AI tool",
    subcategory: tool.subcategories[0] ?? "",
    pricingLabel,
    logoUrl: null,
    score: scoreResult(query, [
      tool.name,
      tool.shortDescription,
      tool.categories.join(" "),
      tool.subcategories.join(" "),
      tool.features.join(" "),
      tool.useCases.join(" "),
      tool.platforms.join(" "),
      pricingLabel,
      tool.api.raw
    ])
  };
}

function scoreResult(query: string, fields: string[]) {
  const normalizedQuery = query.toLowerCase();
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const [name = "", description = "", category = "", subcategory = "", ...rest] = fields.map((field) =>
    field.toLowerCase()
  );

  let score = 0;
  if (name === normalizedQuery) score += 120;
  if (name.startsWith(normalizedQuery)) score += 80;
  if (name.includes(normalizedQuery)) score += 52;
  if (category.includes(normalizedQuery) || subcategory.includes(normalizedQuery)) score += 28;

  for (const term of terms) {
    if (name.includes(term)) score += 18;
    if (category.includes(term) || subcategory.includes(term)) score += 10;
    if (rest.some((field) => field.includes(term))) score += 7;
    if (description.includes(term)) score += 4;
  }

  return score;
}

function sanitizeSearchQuery(value: string) {
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function escapeIlike(value: string) {
  return value.replace(/[%_,]/g, " ").replace(/\s+/g, " ").trim();
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readRelatedName(value: unknown) {
  if (Array.isArray(value)) {
    const first = value[0];
    return isRecord(first) ? readString(first.name) : "";
  }
  return isRecord(value) ? readString(value.name) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getPricingLabel(model: string, hasFreePlan: boolean) {
  if (hasFreePlan) return "Free plan";
  return model || "Pricing varies";
}
