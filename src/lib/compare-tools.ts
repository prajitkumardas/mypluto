import { tools, type ToolRecord } from "@/lib/data";
import { plutosLibrary, searchLibraryTools, type LibraryTool } from "@/lib/plutos-library";
import { getFaviconLogoUrl } from "@/lib/tool-logo";

export type CompareTool = {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  bestFor: string;
  pricing: string;
  startingPrice: string;
  freePlan: string;
  integrations: string[];
  platforms: string[];
  features: string[];
  api: string;
  dataPrivacy: string;
  verification: string;
  trust: string;
  userRating: string;
  primaryUseCases: string[];
  similarUseCases: string[];
  logoUrl: string;
  href: string;
  officialUrl: string;
  chips: string[];
};

const legacyCompareTools = tools.map(mapToolRecord);
const libraryCompareTools = plutosLibrary.tools.map(mapLibraryTool);

export const compareTools = mergeTools([...legacyCompareTools, ...libraryCompareTools]);

export function getCompareTool(slug: string) {
  return compareTools.find((tool) => tool.slug === slug);
}

export function getValidCompareSlugs(slugs: string[]) {
  const seen = new Set<string>();
  return slugs
    .map((slug) => slug.trim())
    .filter((slug) => {
      if (!slug || seen.has(slug) || !getCompareTool(slug)) return false;
      seen.add(slug);
      return true;
    })
    .slice(0, 4);
}

export function searchCompareTools(query: string, selectedSlugs: string[] = [], limit = 18) {
  const normalized = query.trim();
  const libraryMatches = normalized ? searchLibraryTools({ query: normalized, limit }).map((tool) => tool.slug) : [];
  const terms = normalized.toLowerCase().split(/\s+/).filter(Boolean);
  const scored = compareTools.map((tool, index) => ({
    tool,
    score: getSearchScore(tool, terms, libraryMatches.includes(tool.slug)),
    index
  }));

  return scored
    .filter(({ score }) => terms.length === 0 || score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ tool }) => ({ ...tool, alreadySelected: selectedSlugs.includes(tool.slug) }))
    .slice(0, limit);
}

function mergeTools(items: CompareTool[]) {
  const seen = new Set<string>();
  const result: CompareTool[] = [];

  for (const item of items) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    result.push(item);
  }

  return result;
}

function mapToolRecord(tool: ToolRecord): CompareTool {
  return {
    slug: tool.slug,
    name: tool.name,
    category: tool.category,
    shortDescription: tool.tagline,
    bestFor: tool.bestFor,
    pricing: tool.pricing || "Not verified",
    startingPrice: tool.startingPrice || "Not available",
    freePlan: tool.freePlan ? "Yes" : "No",
    integrations: tool.integrations,
    platforms: tool.platforms,
    features: tool.features,
    api: tool.api,
    dataPrivacy: "Review the official policy before sharing sensitive data.",
    verification: tool.verification.status,
    trust: tool.verified ? `Verified ${tool.verified}` : tool.verification.status,
    userRating: "Not available",
    primaryUseCases: tool.useCases,
    similarUseCases: tool.useCases,
    logoUrl: getFaviconLogoUrl(tool.officialUrl),
    href: `/tools/${tool.slug}`,
    officialUrl: tool.officialUrl,
    chips: getChips({
      freePlan: tool.freePlan ? "Yes" : "No",
      integrations: tool.integrations,
      platforms: tool.platforms,
      verification: tool.verification.status,
      useCases: tool.useCases
    })
  };
}

function mapLibraryTool(tool: LibraryTool): CompareTool {
  return {
    slug: tool.slug,
    name: tool.name,
    category: tool.categories[0] ?? "Uncategorized",
    shortDescription: tool.shortDescription || "Not available",
    bestFor: tool.useCases[0] || tool.targetAudiences[0] || "Not available",
    pricing: tool.pricing.model || "Not verified",
    startingPrice: tool.pricing.startingPriceRaw || "Not available",
    freePlan: tool.pricing.freePlanRaw || tool.pricing.freePlan || "Not verified",
    integrations: [...tool.platforms, ...tool.features.filter((feature) => /integration|connect|zapier|slack|google|api/i.test(feature))].slice(0, 5),
    platforms: tool.platforms,
    features: tool.features,
    api: tool.api.normalized || tool.api.raw || "Not available",
    dataPrivacy: tool.limitations || "Not verified",
    verification: tool.verification.status || "Not verified",
    trust: tool.verification.lastVerifiedRaw ? `Checked ${tool.verification.lastVerifiedRaw}` : tool.status || "Not verified",
    userRating: "Not available",
    primaryUseCases: tool.useCases,
    similarUseCases: tool.similarTools.map((item) => item.reason).filter(Boolean),
    logoUrl: getFaviconLogoUrl(tool.domain || tool.officialUrl || tool.originalOfficialUrl),
    href: `/plutos-library/tool/${tool.slug}`,
    officialUrl: tool.officialUrl || tool.originalOfficialUrl,
    chips: getChips({
      freePlan: tool.pricing.freePlanRaw || tool.pricing.freePlan,
      integrations: tool.platforms,
      platforms: tool.platforms,
      verification: tool.verification.status,
      useCases: tool.useCases
    })
  };
}

function getSearchScore(tool: CompareTool, terms: string[], libraryMatched: boolean) {
  if (terms.length === 0) return tool.verification === "Verified" ? 2 : 1;

  const haystack = [
    tool.name,
    tool.category,
    tool.shortDescription,
    tool.bestFor,
    tool.pricing,
    tool.api,
    ...tool.features,
    ...tool.platforms,
    ...tool.primaryUseCases
  ].join(" ").toLowerCase();

  return terms.reduce((score, term) => score + (haystack.includes(term) ? 2 : 0), libraryMatched ? 6 : 0);
}

function getChips(input: {
  freePlan: string;
  integrations: string[];
  platforms: string[];
  verification: string;
  useCases: string[];
}) {
  const chips: string[] = [];
  const text = `${input.useCases.join(" ")} ${input.integrations.join(" ")}`.toLowerCase();

  if (/yes|free/i.test(input.freePlan)) chips.push("Good free plan");
  if (input.integrations.length >= 3 || /zapier|slack|google|microsoft|api/.test(text)) chips.push("Strong integrations");
  if (input.platforms.length >= 3) chips.push("Broad ecosystem");
  if (/beginner|student|creator|small business|easy|template/.test(text)) chips.push("Beginner friendly");
  if (/team|collaboration|workspace/.test(text)) chips.push("Best for teams");
  if (/writing|content|copy|summar/i.test(text)) chips.push("Strong for writing");
  if (/verified/i.test(input.verification)) chips.push("Verified listing");

  return chips.slice(0, 3);
}
