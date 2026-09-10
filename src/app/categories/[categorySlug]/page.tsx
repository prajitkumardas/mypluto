import { notFound } from "next/navigation";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { PlutoButton } from "@/components/ui/pluto-button";
import { ToolCard } from "@/components/tools/tool-card";
import { getCategory, tools } from "@/lib/data";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const categoryTools = tools.filter((tool) => tool.category === category.name);

  return (
    <PageShell>
      <PageHeader
        actions={(
          <PlutoButton href={`/plutos-library?category=${category.slug}`} showArrow variant="secondary">Open in Discover</PlutoButton>
        )}
        eyebrow={category.name}
        title={`${category.name} AI tools`}
        description={category.description}
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {category.filters.map((filter) => (
          <Badge key={filter} tone="neutral">{filter}</Badge>
        ))}
      </div>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="type-h2 text-[var(--text-primary)]">Recommended tools</h2>
          <p className="number type-label-md text-[var(--text-tertiary)]">{categoryTools.length} tools</p>
        </div>
        <CardGrid className="mt-6">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </CardGrid>
      </section>
    </PageShell>
  );
}
