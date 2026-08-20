import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="lime">Curated collection</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        {collection.name}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        {collection.description}
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {tools.slice(0, 4).map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </main>
  );
}
