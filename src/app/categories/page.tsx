import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categories, tools } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="violet">Categories</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        Browse the AI ecosystem by work type.
      </h1>
      <label className="mt-8 flex min-h-14 max-w-2xl items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 shadow-card">
        <Search aria-hidden="true" className="h-5 w-5 text-violet-600" />
        <span className="sr-only">Search categories</span>
        <input className="w-full bg-transparent outline-none" placeholder="Search categories and subcategories" />
      </label>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const featured = tools.find((tool) => tool.category === category.name);
          return (
            <Link
              className="focus-ring group rounded-3xl border border-neutral-200 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:border-violet-500 hover:shadow-elevated"
              href={`/categories/${category.slug}`}
              key={category.slug}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={cn("grid h-14 w-14 place-items-center rounded-2xl", category.tone)}>
                  <category.icon aria-hidden="true" className="h-7 w-7 text-ink-950" />
                </span>
                <ArrowRight className="h-5 w-5 text-neutral-500 transition group-hover:translate-x-1 group-hover:text-violet-600" />
              </div>
              <h2 className="mt-8 font-heading text-3xl font-bold text-neutral-900">
                {category.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{category.description}</p>
              <p className="number mt-4 text-sm font-semibold text-neutral-500">
                {category.count} tools / featured: {featured?.name ?? "Coming soon"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.subcategories.slice(0, 3).map((item) => (
                  <Badge key={item} tone="neutral">{item}</Badge>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
