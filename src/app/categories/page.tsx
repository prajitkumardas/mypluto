import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Search } from "lucide-react";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { categories, tools } from "@/lib/data";
import { cn } from "@/lib/utils";
import { createPageMetadata } from "@/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Tool Categories | Pluto Finds",
  description: "Browse AI tools by creative, development, productivity, writing, business, research and other work categories.",
  path: "/categories"
});

export default function CategoriesPage() {
  return (
    <PageShell>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "AI tool categories",
          itemListElement: categories.map((category, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: category.name,
            url: `${SITE_URL}/categories/${category.slug}`
          }))
        }}
      />
      <PageHeader
        eyebrow="Categories"
        title="Browse the AI ecosystem by work type."
      />
      <label className="pf-search-control mt-8 max-w-[var(--text-width-md)]" data-size="large">
        <Search aria-hidden="true" className="h-5 w-5 text-[var(--color-pluto-purple-300)]" />
        <span className="sr-only">Search categories</span>
        <input className="pf-input-reset" placeholder="Search categories" />
      </label>
      <CardGrid>
        {categories.map((category) => {
          const featured = tools.find((tool) => tool.category === category.name);
          return (
            <Link
              className="focus-ring group rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-xs)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--border-brand)] hover:bg-[var(--surface-hover)]"
              href={`/categories/${category.slug}`}
              key={category.slug}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={cn("grid h-14 w-14 place-items-center rounded-[var(--radius-lg)]", category.tone)}>
                  <category.icon aria-hidden="true" className="h-7 w-7 text-[var(--text-inverse)]" />
                </span>
                <ArrowRight className="h-5 w-5 text-[var(--text-tertiary)] transition group-hover:translate-x-1 group-hover:text-[var(--color-pluto-purple-300)]" />
              </div>
              <h2 className="mt-8 type-h2 text-[var(--text-primary)]">
                {category.name}
              </h2>
              <p className="mt-3 type-body-sm text-[var(--text-secondary)]">{category.description}</p>
              <p className="number mt-4 type-label-md text-[var(--text-tertiary)]">
                {category.count} tools / featured: {featured?.name ?? "Coming soon"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.filters.slice(0, 3).map((item) => (
                  <Badge key={item} tone="neutral">{item}</Badge>
                ))}
              </div>
            </Link>
          );
        })}
      </CardGrid>
    </PageShell>
  );
}
