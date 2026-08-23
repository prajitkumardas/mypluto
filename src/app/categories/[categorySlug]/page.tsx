import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="violet">{category.name}</Badge>
      <div className="mt-4 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <h1 className="type-h1 text-neutral-900">
            {category.name} AI tools
          </h1>
          <p className="mt-4 type-body-lg text-neutral-700">{category.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {category.filters.map((filter) => (
              <Badge key={filter} tone="neutral">{filter}</Badge>
            ))}
          </div>
        </div>
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
          <h2 className="type-h4 text-neutral-900">Subcategories</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {category.subcategories.map((subcategory) => (
              <Link
                className="focus-ring flex min-h-12 items-center justify-between rounded-xl bg-neutral-50 px-3 type-label-md hover:text-violet-600"
                href={`/categories/${category.slug}/${subcategory.toLowerCase().replaceAll(" ", "-")}`}
                key={subcategory}
              >
                {subcategory}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="type-h3 text-neutral-900">Recommended tools</h2>
          <Button asChild variant="secondary">
            <Link href={`/search?q=${encodeURIComponent(category.name)}`}>Search in category</Link>
          </Button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>
    </main>
  );
}
