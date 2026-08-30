import { createClient } from "@supabase/supabase-js";
import { getFaviconLogoUrl } from "@/lib/tool-logo";import { plutosLibrary, slugify, type LibraryTool } from "@/lib/plutos-library";

export const trendPeriods = ["today", "week", "month", "new", "updated"] as const;
export type TrendPeriod = (typeof trendPeriods)[number];

export type TrendEventType =
  | "search_impression"
  | "search_click"
  | "tool_detail_view"
  | "compare_add"
  | "outbound_click"
  | "share";

export type TrendWindow = {
  period: TrendPeriod;
  currentStart: string;
  currentEnd: string;
  previousStart: string | null;
  previousEnd: string | null;
};

export type TrendToolMapping = {
  toolId: string;
  slug: string;
  name: string;
  productHuntId: string | null;
  githubOwner: string | null;
  githubRepo: string | null;
  googleTrendsTerm: string | null;
};

export type ExternalTrendSignal = {
  toolId: string;
  provider: string;
  signalName: string;
  signalValue: number;
  capturedAt: string;
};

export interface TrendDataProvider {
  name: string;
  enabled: boolean;
  fetchSignals(tools: TrendToolMapping[], window: TrendWindow): Promise<ExternalTrendSignal[]>;
}

export type TrendingTool = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  category: string;
  pricingType: string;
  shortDescription: string;
  bestFor: string;
  officialUrl: string;
  releaseDate: string | null;
  lastMaterialUpdateAt: string | null;
  currentScore: number;
  previousScore: number;
  movementPercent: number | null;
  currentRank: number;
  previousRank: number | null;
  rankChange: number | null;
  scoreConfidence: "high" | "medium" | "low";
  calculatedAt: string;
  updateLabel?: string | null;
};

export type TrendingCategory = {
  value: string;
  label: string;
  count: number;
};

export type TrendingResponse = {
  period: TrendPeriod;
  category: string;
  generatedAt: string;
  methodologyVersion: string;
  dataMode: "trend_snapshots" | "fallback_popular";
  label: "Pluto Trend Score" | "Popular tools";
  sourceStatus: {
    pluto: boolean;
    productHunt: boolean;
    github: boolean;
    googleTrends: boolean;
  };
  categories: TrendingCategory[];
  tools: TrendingTool[];
  nextCursor: string | null;
};

type TrendingParams = {
  period?: string | null;
  category?: string | null;
  limit?: string | number | null;
  cursor?: string | null;
};

type SupabaseRankingRow = {
  tool_id?: unknown;
  score?: unknown;
  rank?: unknown;
  previous_rank?: unknown;
  movement_percent?: unknown;
  score_confidence?: unknown;
  calculated_at?: unknown;
  tools?: unknown;
};

type SupabaseToolRow = {
  id?: unknown;
  slug?: unknown;
  name?: unknown;
  logo_url?: unknown;
  official_url?: unknown;
  short_description?: unknown;
  pricing_type?: unknown;
  starting_price_raw?: unknown;
  best_for?: unknown;
  categories?: unknown;
};

const SCORE_VERSION = process.env.TREND_SCORE_VERSION || "v1";
const MAX_LIMIT = 50;

const categoryMatchers: Record<string, { label: string; slugs: string[]; terms: string[] }> = {
  all: { label: "All categories", slugs: [], terms: [] },
  "general-ai": { label: "General AI", slugs: ["ai-assistants-and-chatbots"], terms: ["assistant", "chatbot", "general"] },
  development: { label: "Development", slugs: ["ai-coding-and-development", "ai-developer-infrastructure"], terms: ["coding", "developer", "development", "code"] },
  research: { label: "Research", slugs: ["ai-search-and-research"], terms: ["research", "search", "answer"] },
  design: { label: "Design", slugs: ["ai-image-generation-and-design", "ai-design-and-uiux", "ai-photography"], terms: ["design", "image", "photo", "creative"] },
  writing: { label: "Writing", slugs: ["ai-writing-and-content"], terms: ["writing", "content", "copy"] },
  productivity: { label: "Productivity", slugs: ["ai-business-and-productivity", "ai-meetings-and-collaboration"], terms: ["productivity", "business", "meeting", "workflow"] },
  video: { label: "Video", slugs: ["ai-video"], terms: ["video"] },
  audio: { label: "Audio", slugs: ["ai-audio-and-music"], terms: ["audio", "music", "voice", "transcription"] },
  automation: { label: "Automation", slugs: ["ai-automation-and-no-code"], terms: ["automation", "no-code", "workflow"] },
  presentations: { label: "Presentations", slugs: ["ai-presentations-and-documents"], terms: ["presentation", "slides", "documents"] }
};

export function normalizeTrendPeriod(value: string | null | undefined): TrendPeriod {
  return trendPeriods.includes(value as TrendPeriod) ? (value as TrendPeriod) : "week";
}

export function normalizeTrendCategory(value: string | null | undefined) {
  const normalized = slugify(value || "all");
  return categoryMatchers[normalized] ? normalized : "all";
}

export function getTrendingCategories(): TrendingCategory[] {
  return Object.entries(categoryMatchers).map(([value, matcher]) => ({
    value,
    label: matcher.label,
    count: value === "all" ? plutosLibrary.tools.length : plutosLibrary.tools.filter((tool) => toolMatchesCategory(tool, value)).length
  }));
}

export async function getTrendingResponse(params: TrendingParams = {}): Promise<TrendingResponse> {
  const period = normalizeTrendPeriod(params.period);
  const category = normalizeTrendCategory(params.category);
  const limit = clampNumber(params.limit, 1, MAX_LIMIT, 20);
  const offset = clampNumber(params.cursor, 0, 10000, 0);
  const snapshot = await getSupabaseRanking({ period, category, limit, offset });

  if (snapshot) return snapshot;

  return getFallbackTrendingResponse({ period, category, limit, offset });
}

async function getSupabaseRanking({
  period,
  category,
  limit,
  offset
}: {
  period: TrendPeriod;
  category: string;
  limit: number;
  offset: number;
}): Promise<TrendingResponse | null> {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
  let query = supabase
    .from("trend_rankings")
    .select(
      "tool_id, score, rank, previous_rank, movement_percent, score_confidence, calculated_at, tools!inner(id, slug, name, logo_url, official_url, short_description, pricing_type, starting_price_raw, best_for, categories(name, slug))"
    )
    .eq("period", period)
    .order("rank", { ascending: true })
    .range(offset, offset + limit - 1);

  if (category !== "all") {
    const matcher = categoryMatchers[category];
    query = query.in("tools.category_id", plutosLibrary.categories.filter((item) => matcher.slugs.includes(item.slug)).map((item) => item.id));
  }

  const { data, error } = await query;
  if (error || !Array.isArray(data) || data.length === 0) return null;

  const tools = data
    .map((row) => mapSupabaseRankingRow(row as SupabaseRankingRow))
    .filter((tool): tool is TrendingTool => tool !== null)
    .map((tool, index) => ({ ...tool, currentRank: offset + index + 1 }));

  if (tools.length === 0) return null;

  const generatedAt = tools[0]?.calculatedAt ?? new Date().toISOString();

  return {
    period,
    category,
    generatedAt,
    methodologyVersion: SCORE_VERSION,
    dataMode: "trend_snapshots",
    label: "Pluto Trend Score",
    sourceStatus: getSourceStatus(true),
    categories: getTrendingCategories(),
    tools,
    nextCursor: tools.length === limit ? String(offset + limit) : null
  };
}

function getFallbackTrendingResponse({
  period,
  category,
  limit,
  offset
}: {
  period: TrendPeriod;
  category: string;
  limit: number;
  offset: number;
}): TrendingResponse {
  const generatedAt = plutosLibrary.generatedAt;
  const recentLookup = new Map((plutosLibrary.recentlyAdded ?? []).map((item) => [item.toolName.toLowerCase(), item.dateAdded]));
  const ranked = plutosLibrary.tools
    .filter((tool) => category === "all" || toolMatchesCategory(tool, category))
    .map((tool) => {
      const releaseDate = recentLookup.get(tool.name.toLowerCase()) ?? null;
      const lastMaterialUpdateAt = getVerifiedDate(tool);
      return {
        tool,
        releaseDate,
        lastMaterialUpdateAt,
        score: calculateFallbackScore(tool, period, releaseDate, lastMaterialUpdateAt),
        previousScore: calculateFallbackScore(tool, getPreviousPeriodSeed(period), releaseDate, lastMaterialUpdateAt)
      };
    })
    .filter((item) => {
      if (period === "new") return isWithinDays(item.releaseDate, 30, generatedAt);
      if (period === "updated") return isWithinDays(item.lastMaterialUpdateAt, 30, generatedAt);
      return true;
    })
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));

  const previousRanks = new Map(
    [...ranked]
      .sort((a, b) => b.previousScore - a.previousScore || a.tool.name.localeCompare(b.tool.name))
      .map((item, index) => [item.tool.slug, index + 1])
  );

  const page = ranked.slice(offset, offset + limit);

  return {
    period,
    category,
    generatedAt,
    methodologyVersion: SCORE_VERSION,
    dataMode: "fallback_popular",
    label: "Popular tools",
    sourceStatus: getSourceStatus(false),
    categories: getTrendingCategories(),
    tools: page.map((item, index) => {
      const currentRank = offset + index + 1;
      const previousRank = previousRanks.get(item.tool.slug) ?? null;
      const rankChange = previousRank ? previousRank - currentRank : null;
      return mapLibraryToolToTrendingTool({
        tool: item.tool,
        currentRank,
        previousRank,
        rankChange,
        score: item.score,
        previousScore: item.previousScore,
        releaseDate: item.releaseDate,
        lastMaterialUpdateAt: item.lastMaterialUpdateAt,
        calculatedAt: generatedAt,
        period
      });
    }),
    nextCursor: ranked.length > offset + limit ? String(offset + limit) : null
  };
}

function mapSupabaseRankingRow(row: SupabaseRankingRow): TrendingTool | null {
  const toolRow = isRecord(row.tools) ? (row.tools as SupabaseToolRow) : null;
  if (!toolRow) return null;

  const slug = readString(toolRow.slug);
  const name = readString(toolRow.name);
  if (!slug || !name) return null;

  const currentRank = readNumber(row.rank, 0);
  const previousRank = readNullableNumber(row.previous_rank);
  const rankChange = previousRank && currentRank ? previousRank - currentRank : null;
  const bestFor = readStringArray(toolRow.best_for)[0] ?? readString(toolRow.short_description);

  return {
    id: readString(toolRow.id) || readString(row.tool_id) || slug,
    slug,
    name,
    logoUrl: readString(toolRow.logo_url) || getFaviconLogoUrl(readString(toolRow.official_url)) || null,
    category: readRelatedCategory(toolRow.categories),
    pricingType: readString(toolRow.pricing_type) || "Pricing varies",
    shortDescription: readString(toolRow.short_description),
    bestFor: bestFor || "AI workflow support",
    officialUrl: readString(toolRow.official_url),
    releaseDate: null,
    lastMaterialUpdateAt: null,
    currentScore: readNumber(row.score, 0),
    previousScore: 0,
    movementPercent: readNullableNumber(row.movement_percent),
    currentRank,
    previousRank,
    rankChange,
    scoreConfidence: readConfidence(row.score_confidence),
    calculatedAt: readString(row.calculated_at) || new Date().toISOString(),
    updateLabel: null
  };
}

function mapLibraryToolToTrendingTool({
  tool,
  currentRank,
  previousRank,
  rankChange,
  score,
  previousScore,
  releaseDate,
  lastMaterialUpdateAt,
  calculatedAt,
  period
}: {
  tool: LibraryTool;
  currentRank: number;
  previousRank: number | null;
  rankChange: number | null;
  score: number;
  previousScore: number;
  releaseDate: string | null;
  lastMaterialUpdateAt: string | null;
  calculatedAt: string;
  period: TrendPeriod;
}): TrendingTool {
  return {
    id: tool.id,
    slug: tool.slug,
    name: tool.name,
    logoUrl: getFaviconLogoUrl(tool.domain || tool.officialUrl || tool.originalOfficialUrl) || null,
    category: normalizeCategoryLabel(tool.categories[0] ?? "AI tool"),
    pricingType: tool.pricing.model || "Pricing varies",
    shortDescription: tool.shortDescription,
    bestFor: getBestFor(tool),
    officialUrl: tool.officialUrl || tool.originalOfficialUrl,
    releaseDate,
    lastMaterialUpdateAt,
    currentScore: Math.round(score),
    previousScore: Math.round(previousScore),
    movementPercent: null,
    currentRank,
    previousRank,
    rankChange: period === "new" ? null : rankChange,
    scoreConfidence: "low",
    calculatedAt,
    updateLabel: period === "updated" ? getUpdateLabel(tool) : null
  };
}

function calculateFallbackScore(tool: LibraryTool, period: TrendPeriod | string, releaseDate: string | null, updateDate: string | null) {
  const verifiedBoost = tool.verification.status === "Verified" ? 12 : 0;
  const featureDepth = Math.min(tool.features.length, 12) * 1.8;
  const useCaseDepth = Math.min(tool.useCases.length, 8) * 1.4;
  const platformBreadth = Math.min(tool.platforms.length, 6) * 1.5;
  const similarityInterest = Math.min(tool.similarTools.length, 10) * 2.2;
  const apiBoost = /yes|available|limited|enterprise/i.test(tool.api.normalized || tool.api.raw) ? 4 : 0;
  const freshness = period === "new" ? daysScore(releaseDate, 30) * 28 : daysScore(updateDate, 90) * 8;
  const periodWeight = getPeriodWeight(tool, period);

  return 30 + verifiedBoost + featureDepth + useCaseDepth + platformBreadth + similarityInterest + apiBoost + freshness + periodWeight;
}

function getPeriodWeight(tool: LibraryTool, period: TrendPeriod | string) {
  const text = `${tool.name} ${tool.categories.join(" ")} ${tool.subcategories.join(" ")} ${tool.features.join(" ")} ${tool.useCases.join(" ")}`.toLowerCase();
  const daily = hashToRange(`${tool.slug}:today`, 0, 18) + keywordScore(text, ["chat", "search", "meeting", "image", "video", "code"]);
  const weekly = hashToRange(`${tool.slug}:week`, 0, 15) + keywordScore(text, ["workflow", "team", "automation", "writing", "research", "coding"]);
  const monthly = hashToRange(`${tool.slug}:month`, 0, 12) + keywordScore(text, ["enterprise", "platform", "security", "api", "analytics", "design"]);

  if (period === "today") return daily;
  if (period === "month") return monthly;
  if (period === "new") return daily * 0.4 + weekly * 0.6;
  if (period === "updated") return weekly * 0.4 + monthly * 0.6;
  if (period === "previous-today") return hashToRange(`${tool.slug}:previous-today`, 0, 16) + daily * 0.5;
  if (period === "previous-month") return hashToRange(`${tool.slug}:previous-month`, 0, 11) + monthly * 0.5;
  if (period === "previous-new" || period === "previous-updated") return hashToRange(`${tool.slug}:${period}`, 0, 14) + weekly * 0.5;

  return weekly;
}

function getSourceStatus(hasSnapshots: boolean) {
  return {
    pluto: hasSnapshots,
    productHunt: Boolean(process.env.PRODUCT_HUNT_CLIENT_ID && process.env.PRODUCT_HUNT_CLIENT_SECRET),
    github: Boolean(process.env.GITHUB_TOKEN),
    googleTrends: process.env.GOOGLE_TRENDS_ENABLED === "true"
  };
}

function getPreviousPeriodSeed(period: TrendPeriod): string {
  if (period === "today") return "previous-today";
  if (period === "month") return "previous-month";
  if (period === "new") return "previous-new";
  if (period === "updated") return "previous-updated";
  return "previous-week";
}

function toolMatchesCategory(tool: LibraryTool, category: string) {
  const matcher = categoryMatchers[category];
  if (!matcher || category === "all") return true;
  const toolSlugs = tool.categories.map(slugify);
  if (matcher.slugs.length > 0) return toolSlugs.some((slug) => matcher.slugs.includes(slug));

  const text = `${tool.categories.join(" ")} ${tool.subcategories.join(" ")} ${tool.features.join(" ")} ${tool.useCases.join(" ")}`.toLowerCase();
  return matcher.terms.some((term) => text.includes(term));
}

function getBestFor(tool: LibraryTool) {
  return tool.useCases[0] || tool.targetAudiences[0] || tool.shortDescription || "AI workflow support";
}

function getVerifiedDate(tool: LibraryTool) {
  return /^\d{4}-\d{2}-\d{2}$/.test(tool.verification.lastVerifiedRaw) ? tool.verification.lastVerifiedRaw : null;
}

function getUpdateLabel(tool: LibraryTool) {
  const feature = tool.features[0];
  if (!feature) return "Verified library update";
  return feature.length > 44 ? `${feature.slice(0, 41).trim()}...` : feature;
}

function normalizeCategoryLabel(value: string) {
  return value.replace(/^AI\s+/i, "").replace(/\s*&\s*/g, " & ");
}

function daysScore(date: string | null, windowDays: number) {
  if (!date) return 0;
  const days = daysBetween(date, plutosLibrary.generatedAt);
  if (days === null || days > windowDays) return 0;
  return Math.max(0, 1 - days / windowDays);
}

function isWithinDays(date: string | null, windowDays: number, relativeTo: string) {
  const days = daysBetween(date, relativeTo);
  return days !== null && days >= 0 && days <= windowDays;
}

function daysBetween(date: string | null, relativeTo: string) {
  if (!date) return null;
  const left = new Date(date).getTime();
  const right = new Date(relativeTo).getTime();
  if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
  return Math.floor((right - left) / 86400000);
}

function keywordScore(text: string, terms: string[]) {
  return terms.reduce((score, term) => score + (text.includes(term) ? 3 : 0), 0);
}

function hashToRange(input: string, min: number, max: number) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const normalized = (hash >>> 0) / 4294967295;
  return min + normalized * (max - min);
}

function clampNumber(value: string | number | null | undefined, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readNullableNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readRelatedCategory(value: unknown) {
  if (Array.isArray(value)) {
    const first = value[0];
    return isRecord(first) ? readString(first.name) || "AI tool" : "AI tool";
  }
  return isRecord(value) ? readString(value.name) || "AI tool" : "AI tool";
}

function readConfidence(value: unknown): "high" | "medium" | "low" {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
