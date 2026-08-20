import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ToolCard } from "@/components/tools/tool-card";
import { getCategory, tools } from "@/lib/data";

type SubcategoryPageProps = {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
};

export default async function SubcategoryPage({ params }: SubcategoryPageProps) {
  const { categorySlug, subcategorySlug } = await params;
  const category = getCategory(categorySlug);

  if (!category) {
    notFound();
  }

  const normalized = subcategorySlug.replaceAll("-", " ");
  const matchingTools = tools.filter(
    (tool) =>
      tool.category === category.name &&
      tool.subcategory.toLowerCase() === normalized.toLowerCase()
  );

  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="violet">{category.name}</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        {normalized} tools
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Category-specific filters are tailored to the workflow, such as
        commercial usage, API support, batch generation or platform availability.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {(matchingTools.length ? matchingTools : tools.filter((tool) => tool.category === category.name)).map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </main>
  );
}
