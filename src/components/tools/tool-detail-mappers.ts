import type { ToolRecord } from "@/lib/data";
import { tools } from "@/lib/data";
import type { LibraryTool } from "@/lib/plutos-library";
import { getSimilarLibraryTools, slugify } from "@/lib/plutos-library";
import { getFaviconLogoUrl } from "@/lib/tool-logo";
import type { ToolDetailAlternative, ToolDetailSource, ToolDetailTone, ToolDetailViewModel } from "./tool-detail-view";

const NOT_AVAILABLE = "Not available";
const NOT_VERIFIED = "Not verified";

export function mapLibraryToolToDetail(tool: LibraryTool): ToolDetailViewModel {
  const officialUrl = safeUrl(tool.officialUrl || tool.originalOfficialUrl);
  const domain = clean(tool.domain) || domainFromUrl(officialUrl);
  const category = clean(tool.categories[0]) || NOT_AVAILABLE;
  const subcategory = clean(tool.subcategories[0]) || category;
  const verificationTone = toneForVerification(tool.verification.status);
  const sources = buildSources(tool.verification.sourceRaw, domain, officialUrl);
  const confidence = confidenceFor(tool.verification.status, sources.length);
  const similarTools = getSimilarLibraryTools(tool)
    .map((item) => item.tool ? libraryAlternative(item.tool) : null)
    .filter((item): item is ToolDetailAlternative => Boolean(item))
    .slice(0, 6);

  return {
    api: clean(tool.api.normalized || tool.api.raw) || NOT_AVAILABLE,
    bestFor: compactList([...tool.targetAudiences, ...tool.useCases], 5),
    breadcrumb: [
      { href: "/plutos-library", label: "Discover" },
      ...(category !== NOT_AVAILABLE ? [{ href: `/plutos-library/${slugify(category)}`, label: category }] : []),
      { label: tool.name }
    ],
    capabilities: compactList(tool.features, 8),
    category,
    chips: compactList([subcategory, tool.pricing.model, tool.api.normalized], 3),
    commercialUse: commercialUseText(tool),
    company: companyFromDomain(domain) || NOT_AVAILABLE,
    confidence: confidence.label,
    confidenceTone: confidence.tone,
    description: clean(tool.shortDescription) || "This tool is listed in the PlutoFinds AI tools directory. Verify important details on the official website before using it.",
    domain: domain || NOT_AVAILABLE,
    freePlan: clean(tool.pricing.freePlanRaw || tool.pricing.freePlan) || NOT_AVAILABLE,
    href: `/plutos-library/tool/${tool.slug}`,
    integrations: inferIntegrations(tool.features),
    lastChecked: clean(tool.verification.lastVerifiedRaw) || NOT_VERIFIED,
    limitations: splitPoints(tool.limitations),
    logoUrl: getFaviconLogoUrl(officialUrl || domain),
    name: tool.name,
    officialUrl,
    platforms: compactList(tool.platforms, 6),
    pricing: clean(tool.pricing.model) || NOT_AVAILABLE,
    pricingDetail: pricingText(tool.pricing.model, tool.pricing.freePlanRaw || tool.pricing.freePlan, tool.pricing.startingPriceRaw),
    privacy: "Review the official privacy policy before sharing sensitive data or customer content.",
    similarTools,
    slug: tool.slug,
    sourceCountLabel: sourceCountLabel(sources),
    sources,
    strengths: buildLibraryStrengths(tool),
    subcategory,
    verificationStatus: clean(tool.verification.status) || NOT_VERIFIED,
    verificationTone,
    websiteStatus: websiteStatus(tool.status, officialUrl),
    websiteTone: websiteTone(tool.status, officialUrl)
  };
}

export function mapCuratedToolToDetail(tool: ToolRecord, libraryTool?: LibraryTool): ToolDetailViewModel {
  if (libraryTool) return mapLibraryToolToDetail(libraryTool);

  const officialUrl = safeUrl(tool.officialUrl);
  const domain = domainFromUrl(officialUrl);
  const verificationTone = toneForVerification(tool.verification.status);
  const sources = buildSources("Official website", domain, officialUrl);
  const alternatives = tool.alternatives
    .map((slug) => tools.find((candidate) => candidate.slug === slug))
    .filter((item): item is ToolRecord => Boolean(item))
    .map((item) => ({
      category: item.category,
      href: `/tools/${item.slug}`,
      logoUrl: getFaviconLogoUrl(item.officialUrl),
      name: item.name,
      slug: item.slug
    }))
    .slice(0, 6);

  return {
    api: tool.api,
    bestFor: compactList([tool.bestFor, ...tool.targetAudience], 5),
    breadcrumb: [
      { href: "/tools", label: "All AI Tools" },
      { href: `/categories/${slugify(tool.category)}`, label: tool.category },
      { label: tool.name }
    ],
    capabilities: compactList(tool.features, 8),
    category: tool.category,
    chips: compactList([tool.subcategory, tool.pricing, tool.skillLevel], 3),
    commercialUse: "Review current official terms for commercial use and generated outputs.",
    company: companyFromDomain(domain) || tool.name,
    confidence: tool.verification.status === "Verified" ? "High" : "Medium",
    confidenceTone: tool.verification.status === "Verified" ? "success" : "warning",
    description: tool.tagline || tool.description,
    domain,
    freePlan: tool.freePlan ? "Available" : "Not listed",
    href: `/tools/${tool.slug}`,
    integrations: compactList(tool.integrations, 6),
    lastChecked: tool.verified || NOT_VERIFIED,
    limitations: compactList(tool.limitations, 4),
    logoUrl: getFaviconLogoUrl(officialUrl),
    name: tool.name,
    officialUrl,
    platforms: compactList(tool.platforms, 6),
    pricing: tool.pricing || NOT_AVAILABLE,
    pricingDetail: `${tool.pricing || "Pricing"}${tool.startingPrice ? `, starting at ${tool.startingPrice}` : ""}. Confirm current pricing on the official website.`,
    privacy: "Review the official privacy policy before sharing sensitive data or customer content.",
    similarTools: alternatives,
    slug: tool.slug,
    sourceCountLabel: sourceCountLabel(sources),
    sources,
    strengths: compactList(tool.advantages, 4),
    subcategory: tool.subcategory,
    verificationStatus: tool.verification.status,
    verificationTone,
    websiteStatus: tool.verification.website ? "Website active" : "Check official site",
    websiteTone: tool.verification.website ? "success" : "warning"
  };
}

function libraryAlternative(tool: LibraryTool): ToolDetailAlternative {
  const officialUrl = safeUrl(tool.officialUrl || tool.originalOfficialUrl);
  return {
    category: clean(tool.categories[0]) || "AI tool",
    href: `/plutos-library/tool/${tool.slug}`,
    logoUrl: getFaviconLogoUrl(officialUrl || tool.domain),
    name: tool.name,
    slug: tool.slug
  };
}

function buildLibraryStrengths(tool: LibraryTool) {
  return compactList([
    ...tool.features.slice(0, 2),
    ...tool.useCases.slice(0, 1),
    tool.verification.status === "Verified" ? "Record includes verified source checks" : "Listed with structured PlutoFinds metadata"
  ], 4);
}

function commercialUseText(tool: LibraryTool) {
  const text = [...tool.features, ...tool.useCases, tool.limitations, tool.shortDescription].join(" ").toLowerCase();
  if (text.includes("commercial")) return "Commercial use may be supported under current official terms; review plan-specific terms.";
  return "Check official terms for commercial-use rights and licensing details.";
}

function pricingText(model: string, freePlan: string, startingPrice: string) {
  const parts = [clean(model), clean(freePlan), clean(startingPrice)].filter(Boolean);
  if (parts.length === 0) return "Pricing is not available in the current PlutoFinds record. Check the official website.";
  return `${parts.join(". ")}. Confirm current pricing and usage limits on the official website.`;
}

function buildSources(raw: string, domain: string, officialUrl: string): ToolDetailSource[] {
  const cleanRaw = clean(raw);
  const candidates = cleanRaw && !/not independently verified|not verified this session/i.test(cleanRaw)
    ? cleanRaw.split(/[;,|]/).map((item) => item.trim()).filter(Boolean)
    : [];
  const baseDomain = domain || domainFromUrl(officialUrl);
  const domains = candidates.length > 0 ? candidates : [baseDomain || "Official website"];

  return domains.slice(0, 4).map((item, index) => {
    const sourceDomain = normalizeDomain(item) || baseDomain;
    const href = sourceDomain ? `https://${sourceDomain}` : officialUrl;
    return {
      domain: sourceDomain || baseDomain || NOT_AVAILABLE,
      href,
      official: isOfficialSource(sourceDomain, baseDomain),
      title: index === 0 ? "Official website" : sourceTitle(sourceDomain || item),
      type: sourceType(sourceDomain || item)
    };
  });
}

function sourceTitle(value: string) {
  if (/help|docs|support/i.test(value)) return "Support docs";
  if (/press|blog|news/i.test(value)) return "Announcement";
  if (/pricing/i.test(value)) return "Pricing page";
  return "Source";
}

function sourceType(value: string) {
  if (/help|docs|support/i.test(value)) return "Documentation";
  if (/press|blog|news/i.test(value)) return "Company update";
  if (/pricing/i.test(value)) return "Pricing";
  return "Website";
}

function isOfficialSource(sourceDomain: string, baseDomain: string) {
  if (!sourceDomain || !baseDomain) return false;
  return rootDomain(sourceDomain) === rootDomain(baseDomain);
}

function confidenceFor(status: string, sourceCount: number): { label: string; tone: ToolDetailTone } {
  const normalized = status.toLowerCase();
  if (normalized === "verified" && sourceCount > 0) return { label: "High", tone: "success" };
  if (normalized.includes("partial") || sourceCount > 1) return { label: "Medium", tone: "warning" };
  return { label: "Needs review", tone: "warning" };
}

function websiteStatus(status: string, officialUrl: string) {
  const value = clean(status).toLowerCase();
  if (value.includes("active") || officialUrl) return "Website active";
  if (value.includes("unavailable") || value.includes("sunset")) return "Website unavailable";
  return "Check official site";
}

function websiteTone(status: string, officialUrl: string): ToolDetailTone {
  const value = clean(status).toLowerCase();
  if (value.includes("unavailable") || value.includes("sunset")) return "danger";
  return officialUrl || value.includes("active") ? "success" : "warning";
}

function toneForVerification(status: string): ToolDetailTone {
  const normalized = status.toLowerCase();
  if (normalized === "verified") return "success";
  if (normalized.includes("unavailable") || normalized.includes("sunset")) return "danger";
  if (normalized.includes("needs") || normalized.includes("partial") || normalized.includes("review")) return "warning";
  return "neutral";
}

function inferIntegrations(features: string[]) {
  return compactList(features.filter((feature) => /integration|plugin|workspace|api|export|import|connect/i.test(feature)), 6);
}

function sourceCountLabel(sources: ToolDetailSource[]) {
  return `${sources.length} ${sources.length === 1 ? "source" : "sources"}`;
}

function splitPoints(value: string) {
  const cleanValue = clean(value);
  if (!cleanValue) return [];
  return cleanValue
    .split(/;|\n|\.\s+/)
    .map((item) => item.replace(/[.]+$/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function compactList(values: string[], limit: number) {
  return [...new Set(values.map(clean).filter(Boolean))].slice(0, limit);
}

function clean(value: string | undefined | null) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function safeUrl(value: string) {
  const trimmed = clean(value);
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function domainFromUrl(value: string) {
  try {
    return new URL(safeUrl(value)).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function normalizeDomain(value: string) {
  const trimmed = clean(value)
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split(/[/?#]/)[0]
    .trim();
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed) ? trimmed : "";
}

function rootDomain(value: string) {
  const parts = value.replace(/^www\./, "").split(".").filter(Boolean);
  return parts.slice(-2).join(".");
}

function companyFromDomain(domain: string) {
  const root = rootDomain(domain).split(".")[0] || "";
  if (!root) return "";
  return root
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}