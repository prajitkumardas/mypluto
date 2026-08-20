import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/shared/state-panel";
import { ToolCard } from "@/components/tools/tool-card";
import { categories, collections, searchTools, useCases } from "@/lib/data";

type SearchPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const results = searchTools(q);

  return (
    <main className="mx-auto max-w-site px-5 py-14 sm:px-8 lg:py-20 xl:px-0">
      <Badge tone="lime">Global search</Badge>
      <h1 className="mt-4 font-heading text-5xl font-bold text-neutral-900">
        Search results for {q ? `"${q}"` : "your next task"}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-700">
        Results are grouped by recommendation fit, exact matches, categories,
        use cases and curated collections.
      </p>

      <form className="mt-8 flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-white p-3 shadow-card sm:flex-row" action="/search">
        <label className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl bg-neutral-50 px-4">
          <Search aria-hidden="true" className="h-5 w-5 text-violet-600" />
          <span className="sr-only">Search query</span>
          <input
            className="w-full bg-transparent outline-none placeholder:text-neutral-500"
            defaultValue={q}
            name="q"
            placeholder="Free image generator with commercial use"
          />
        </label>
        <Button type="submit">Search again</Button>
      </form>

      {results.length > 0 ? (
        <>
          <section className="mt-10">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-3xl font-bold text-neutral-900">
                Recommended tools
              </h2>
              <p className="number text-sm font-semibold text-neutral-500">
                {results.length} results
              </p>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {results.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="mt-10">
          <StatePanel
            action="Ask Pluto"
            copy="Your original query is preserved. Try removing filters, checking spelling, browsing related categories or asking Pluto for close matches."
            secondary="Browse categories"
            title="No search results"
          />
        </div>
      )}

      <section className="mt-12 grid gap-5 lg:grid-cols-3">
        <SuggestionGroup title="Categories" items={categories.map((item) => [item.name, `/categories/${item.slug}`])} />
        <SuggestionGroup title="Use cases" items={useCases.map((item) => [item.title, `/use-cases/${item.slug}`])} />
        <SuggestionGroup title="Collections" items={collections.map((item) => [item.name, `/collections/${item.slug}`])} />
      </section>
    </main>
  );
}

function SuggestionGroup({ title, items }: { title: string; items: string[][] }) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
      <h2 className="font-heading text-xl font-bold text-neutral-900">{title}</h2>
      <div className="mt-4 grid gap-2">
        {items.slice(0, 4).map(([label, href]) => (
          <Button asChild key={href} variant="ghost">
            <Link className="justify-between" href={href}>
              {label} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
