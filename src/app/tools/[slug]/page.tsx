import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewedMarker } from "@/components/tools/viewed-marker";
import { ToolDetailView } from "@/components/tools/tool-detail-view";
import { mapCuratedToolToDetail } from "@/components/tools/tool-detail-mappers";
import { getTool } from "@/lib/data";
import { getLibraryTool } from "@/lib/plutos-library";
import { StructuredData } from "@/components/seo/structured-data";
import { createPageMetadata, SITE_URL } from "@/lib/seo";

type ToolDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ToolDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  const libraryTool = getLibraryTool(slug);
  const name = tool?.name || libraryTool?.name;
  const description = tool?.tagline || libraryTool?.shortDescription;

  if (!name) {
    return {
      title: "AI tool not found - Pluto Finds"
    };
  }

  return createPageMetadata({
    title: `${name} - AI Tool Details | Pluto Finds`,
    description: description || `Review ${name} details, verification, pricing and similar AI tools on Pluto Finds.`,
    path: `/tools/${slug}`
  });
}

export default async function ToolDetailPage({ params }: ToolDetailProps) {
  const { slug } = await params;
  const tool = getTool(slug);
  const libraryTool = getLibraryTool(slug);

  if (!tool && !libraryTool) {
    notFound();
  }

  const model = tool ? mapCuratedToolToDetail(tool, libraryTool) : mapCuratedToolToDetailFallback(libraryTool!);

  return (
    <>
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Discover", item: `${SITE_URL}/plutos-library` },
              { "@type": "ListItem", position: 3, name: model.name, item: `${SITE_URL}/tools/${model.slug}` }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: model.name,
            description: model.description,
            applicationCategory: model.category,
            operatingSystem: model.platforms.length > 0 ? model.platforms.join(", ") : "Web",
            url: `${SITE_URL}/tools/${model.slug}`,
            sameAs: model.officialUrl || undefined
          }
        ]}
      />
      <ViewedMarker logoUrl={model.logoUrl} name={model.name} slug={model.slug} />
      <ToolDetailView tool={model} />
    </>
  );
}

function mapCuratedToolToDetailFallback(tool: NonNullable<ReturnType<typeof getLibraryTool>>) {
  return mapCuratedToolToDetail({
    slug: tool.slug,
    rank: 0,
    name: tool.name,
    category: tool.categories[0] || "AI tool",
    subcategory: tool.subcategories[0] || tool.categories[0] || "AI tool",
    tagline: tool.shortDescription,
    description: tool.shortDescription,
    pricing: tool.pricing.model,
    startingPrice: tool.pricing.startingPriceRaw,
    freePlan: /yes|free/i.test(tool.pricing.freePlan),
    platforms: tool.platforms,
    api: tool.api.normalized === "Yes" ? "Available" : tool.api.normalized === "No" ? "No public API" : "Limited",
    bestFor: tool.useCases[0] || tool.targetAudiences[0] || "AI workflows",
    targetAudience: tool.targetAudiences,
    skillLevel: "Intermediate",
    features: tool.features,
    useCases: tool.useCases,
    integrations: [],
    advantages: tool.features.slice(0, 3),
    limitations: tool.limitations ? [tool.limitations] : [],
    alternatives: tool.similarTools.map((item) => item.slug),
    verified: tool.verification.lastVerifiedRaw,
    verification: {
      website: Boolean(tool.officialUrl || tool.originalOfficialUrl),
      pricing: !/not verified|not independently/i.test(tool.pricing.startingPriceRaw),
      features: tool.features.length > 0,
      status: tool.verification.status === "Verified" ? "Verified" : "Needs review"
    },
    officialUrl: tool.officialUrl || tool.originalOfficialUrl,
    movement: "",
    trendingReason: "",
    accent: "#7C63FF",
    openSource: false
  }, tool);
}
