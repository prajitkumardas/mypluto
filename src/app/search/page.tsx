import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { CardGrid } from "@/components/layout/card-grid";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { PlutoButton } from "@/components/ui/pluto-button";
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
    <PageShell>
      <PageHeader
        eyebrow="Global search"
        eyebrowTone="lime"
        title={`Search results for ${q ? `\"${q}\"` : "your next task"}`}
        description="Results are grouped by recommendation fit, exact matches, categories, use cases and curated collections."
      />

      <form className="mt-8 flex flex-col gap-3 rounded-[var(--radius-2xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-3 shadow-[var(--shadow-xs)] sm:flex-row" action="/search">
        <label className="flex min-h-14 flex-1 items-center gap-3 rounded-[var(--radius-xl)] bg-[var(--background-interactive)] px-4">
          <Search aria-hidden="true" className="h-5 w-5 text-[var(--color-pluto-purple-300)]" />
          <span className="sr-only">Search query</span>
          <input
            className="w-full bg-transparent type-body-md outline-none placeholder:text-[var(--text-tertiary)]"
            defaultValue={q}
            name="q"
            placeholder="Free image generator with commercial use"
          />
        </label>
        <PlutoButton type="submit" variant="primary">Search again</PlutoButton>
      </form>

      {results.length > 0 ? (
        <section className="mt-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="type-h2 text-[var(--text-primary)]">Recommended tools</h2>
            <p className="number type-label-md text-[var(--text-tertiary)]">{results.length} results</p>
          </div>
          <CardGrid className="mt-5">
            {results.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </CardGrid>
        </section>
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
    </PageShell>
  );
}

function SuggestionGroup({ title, items }: { title: string; items: string[][] }) {
  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-raised)] p-5 shadow-[var(--shadow-xs)]">
      <h2 className="type-h2 text-[var(--text-primary)]">{title}</h2>
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
