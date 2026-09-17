import { notFound } from "next/navigation";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { collections, tools } from "@/lib/data";
import { createPageMetadata } from "@/lib/seo";

type CollectionPageProps = {
  params: Promise<{ collectionSlug: string }>;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { collectionSlug } = await params;
  const collection = collections.find((item) => item.slug === collectionSlug);
  if (!collection) return createPageMetadata({ title: "Collection not found | Pluto Finds", description: "This curated collection could not be found.", path: `/collections/${collectionSlug}`, noIndex: true });
  return createPageMetadata({ title: `${collection.name} | Pluto Finds`, description: collection.description, path: `/collections/${collection.slug}` });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionSlug } = await params;
  const collection = collections.find((item) => item.slug === collectionSlug);

  if (!collection) {
    notFound();
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Curated collection"
        eyebrowTone="lime"
        title={collection.name}
        description={collection.description}
      />
      <CardGrid>
        {tools.slice(0, 4).map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </CardGrid>
    </PageShell>
  );
}
import type { Metadata } from "next";
