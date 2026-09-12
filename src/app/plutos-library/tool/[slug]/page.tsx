import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolDetailView } from "@/components/tools/tool-detail-view";
import { ViewedMarker } from "@/components/tools/viewed-marker";
import { mapLibraryToolToDetail } from "@/components/tools/tool-detail-mappers";
import { getLibraryTool, plutosLibrary } from "@/lib/plutos-library";

type ToolDetailProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return plutosLibrary.tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getLibraryTool(slug);

  if (!tool) {
    return {
      title: "AI tool not found - Pluto Finds"
    };
  }

  return {
    title: `${tool.name} - AI Tool Details | Pluto Finds`,
    description: tool.shortDescription || `Review ${tool.name} details, verification, pricing and similar AI tools on PlutoFinds.`,
    alternates: {
      canonical: `/tools/${tool.slug}`
    }
  };
}

export default async function LibraryToolDetailPage({ params }: ToolDetailProps) {
  const { slug } = await params;
  const tool = getLibraryTool(slug);

  if (!tool) {
    notFound();
  }

  const model = mapLibraryToolToDetail(tool);

  return (
    <>
      <ViewedMarker logoUrl={model.logoUrl} name={model.name} slug={model.slug} />
      <ToolDetailView tool={model} />
    </>
  );
}
