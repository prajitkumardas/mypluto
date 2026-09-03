import { notFound } from "next/navigation";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { ToolCard } from "@/components/tools/tool-card";
import { collections, tools } from "@/lib/data";

type CollectionPageProps = {
  params: Promise<{ collectionSlug: string }>;
};

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